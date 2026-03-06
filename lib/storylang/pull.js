'use strict';

/**
 * storylang pull
 *
 * Scans the current Ember project and writes/updates config/storylang.json
 * from the actual files that exist in the app/ directory.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toCamelCase(str) {
  return str.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

/**
 * Walk a directory and return all files (recursively) that pass the filter fn.
 */
function walkDir(dir, filterFn = () => true) {
  if (!fs.existsSync(dir)) return [];
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath, filterFn));
    } else if (filterFn(entry.name, fullPath)) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Given a file path inside app/<category>/, derive a kebab-case name
 * suitable for storylang.json.
 */
function nameFromPath(filePath, appDir, category) {
  const rel = path.relative(path.join(appDir, category), filePath);
  // strip extension(s) and turn path separators into slashes (nested components)
  return rel
    .replace(/\.(js|ts|hbs|scss|css)$/, '')
    .split(path.sep)
    .join('/');
}

// ---------------------------------------------------------------------------
// Parsers — extract metadata from source files
// ---------------------------------------------------------------------------

/**
 * Very lightweight static analysis: look for @tracked, @action, @service,
 * imported helpers / modifiers, and inherited args from HBS counterpart.
 */
function parseJsFile(filePath) {
  const src = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf8') : '';

  // @tracked varName
  const trackedVars = [...src.matchAll(/@tracked\s+(\w+)\s*(?:=\s*([^;]+))?/g)].map(
    ([, name, val]) => {
      const type = inferType(val);
      return { [name]: type };
    }
  );

  // @action methodName(
  const actions = [...src.matchAll(/@action\s*\n?\s*(?:async\s+)?(\w+)\s*\(/g)].map(
    ([, name]) => name
  );

  // @service serviceName;
  const services = [...src.matchAll(/@service\s+(\w+)/g)].map(([, name]) => name);

  // queryParams = { key: ... }
  const getVars = [...src.matchAll(/queryParams\s*=\s*\{([^}]+)\}/gs)].flatMap(([, block]) =>
    [...block.matchAll(/(\w+)\s*:/g)].map(([, k]) => ({ [k]: 'string' }))
  );

  return { trackedVars, actions, services, getVars };
}

function inferType(val = '') {
  val = (val || '').trim();
  if (val === 'false' || val === 'true') return 'bool';
  if (val.startsWith('[')) return 'array';
  if (val.startsWith('{') || val.startsWith('new Map') || val.startsWith('new Set'))
    return 'object';
  if (/^\d+$/.test(val)) return 'int';
  if (val.startsWith("'") || val.startsWith('"') || val.startsWith('`')) return 'string';
  return 'string';
}

/**
 * Parse a Handlebars template for:
 *  - @arg references  → inherited_args
 *  - <ComponentName> invocations → sub-components used
 *  - {{helper-name}} calls → helpers used
 *  - {{modifier}} element modifiers → modifiers used
 */
function parseHbsFile(filePath) {
  if (!fs.existsSync(filePath)) return { inheritedArgs: [], helpers: [], modifiers: [], components: [] };

  const src = fs.readFileSync(filePath, 'utf8');

  // @argName (distinct, excluding @glimmer internals)
  const inheritedArgsSet = new Set(
    [...src.matchAll(/@(\w[\w.]*)/g)]
      .map(([, name]) => name.split('.')[0])
      .filter((n) => !['ember', 'glimmer'].includes(n))
  );
  const inheritedArgs = [...inheritedArgsSet].map((name) => ({ [name]: 'var' }));

  // {{some-helper ...}} — exclude built-ins
  const builtinHelpers = new Set([
    'if', 'unless', 'each', 'let', 'with', 'yield', 'outlet', 'component',
    'on', 'get', 'concat', 'array', 'hash', 'log', 'action', 'mut',
    'page-title', 'link-to', 'BasicDropdownWormhole',
  ]);
  const helpersSet = new Set(
    [...src.matchAll(/\{\{([\w-]+)/g)]
      .map(([, name]) => name)
      .filter((n) => n.includes('-') && !builtinHelpers.has(n))
  );
  const helpers = [...helpersSet];

  // {{modifier-name}} inside element modifier position — {{some-modifier ...}}
  const modifiersSet = new Set(
    [...src.matchAll(/\{\{([\w-]+-modifier|autofocus|tooltip|play-when|[\w-]+)\s/g)]
      .map(([, name]) => name)
      .filter((n) => helpers.includes(n) === false && !builtinHelpers.has(n))
  );
  const modifiers = [...modifiersSet];

  // <ComponentName  (PascalCase or path-style)
  const componentsSet = new Set(
    [...src.matchAll(/<([A-Z][\w::/]*)/g)].map(([, name]) => name)
  );
  const components = [...componentsSet];

  return { inheritedArgs, helpers, modifiers, components };
}

/**
 * Sniff the type of component from its name, matching README built-in types.
 */
function guessComponentType(name) {
  const LAYOUT = ['table', 'figure', 'accordion', 'card', 'list-group', 'navbar', 'nav', 'tab', 'breadcrumb'];
  const INTERACTIVE = [
    'button', 'button-group', 'dropdown', 'modal', 'collapse', 'offcanvas', 'pagination',
    'popover', 'tooltip', 'swiper-carousel', 'videojs-player', 'howlerjs-player', 'input-field',
    'input-group', 'textarea', 'checkbox', 'radio', 'range', 'select', 'multi-select', 'date',
    'file-uploader', 'alert', 'badge', 'toast', 'placeholder', 'progress', 'spinner', 'scrollspy',
  ];
  for (const t of [...LAYOUT, ...INTERACTIVE]) {
    if (name.includes(t)) return t;
  }
  return 'component';
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildComponents(appDir) {
  const componentDir = path.join(appDir, 'components');
  const jsFiles = walkDir(componentDir, (n) => /\.(js|ts)$/.test(n));

  return jsFiles.map((jsFile) => {
    const name = nameFromPath(jsFile, appDir, 'components');
    const hbsFile = jsFile.replace(/\.(js|ts)$/, '.hbs');
    const { trackedVars, actions, services } = parseJsFile(jsFile);
    const { inheritedArgs, helpers, modifiers } = parseHbsFile(hbsFile);

    return {
      name,
      type: guessComponentType(name),
      tracked_vars: trackedVars,
      inherited_args: inheritedArgs,
      actions,
      helpers,
      modifiers,
      services,
    };
  });
}

function buildRoutes(appDir) {
  const routeDir = path.join(appDir, 'routes');
  const jsFiles = walkDir(routeDir, (n) => /\.(js|ts)$/.test(n));

  return jsFiles.map((jsFile) => {
    const name = nameFromPath(jsFile, appDir, 'routes');
    const hbsFile = path.join(appDir, 'templates', name.replace(/\/$/, '') + '.hbs');
    const { trackedVars, actions, services, getVars } = parseJsFile(jsFile);
    const { helpers, components } = parseHbsFile(hbsFile);

    return {
      name,
      tracked_vars: trackedVars,
      get_vars: getVars,
      actions,
      helpers,
      services,
      components,
      types: [],
    };
  });
}

function buildServices(appDir) {
  const serviceDir = path.join(appDir, 'services');
  const jsFiles = walkDir(serviceDir, (n) => /\.(js|ts)$/.test(n));

  return jsFiles.map((jsFile) => {
    const name = nameFromPath(jsFile, appDir, 'services');
    const { trackedVars, actions, services } = parseJsFile(jsFile);
    return { name, tracked_vars: trackedVars, actions, services };
  });
}

function buildHelpers(appDir) {
  const helperDir = path.join(appDir, 'helpers');
  const jsFiles = walkDir(helperDir, (n) => /\.(js|ts)$/.test(n));

  return jsFiles.map((jsFile) => {
    const name = nameFromPath(jsFile, appDir, 'helpers');
    const src = fs.readFileSync(jsFile, 'utf8');

    // Infer args from function signature
    const sig = src.match(/function\s+\w*\s*\(\[([^\]]*)\](?:,\s*\{([^}]*)\})?\)/);
    const posArgs = sig ? sig[1].split(',').map((s) => s.trim()).filter(Boolean).map((a) => ({ [a]: 'string' })) : [];
    const namedArgs = sig && sig[2]
      ? sig[2].split(',').map((s) => s.trim().split(/\s*=\s*/)[0]).filter(Boolean).map((a) => ({ [a]: 'string' }))
      : [];

    return {
      name,
      description: '',
      args: [...posArgs, ...namedArgs],
      return: 'string',
    };
  });
}

function buildModifiers(appDir) {
  const modifierDir = path.join(appDir, 'modifiers');
  const jsFiles = walkDir(modifierDir, (n) => /\.(js|ts)$/.test(n));

  return jsFiles.map((jsFile) => {
    const name = nameFromPath(jsFile, appDir, 'modifiers');
    const { services } = parseJsFile(jsFile);
    return { name, description: '', args: [], services };
  });
}

/**
 * Build the types section by cross-referencing component/route usages.
 */
function buildTypes(routes, components, services) {
  const typeMap = new Map();

  function register(typeSlug, category, name) {
    if (!typeMap.has(typeSlug)) {
      typeMap.set(typeSlug, { routes: [], components: [], services: [], helpers: [], modifiers: [] });
    }
    typeMap.get(typeSlug)[category].push(name);
  }

  for (const r of routes) {
    for (const t of r.types || []) register(t, 'routes', r.name);
  }
  for (const c of components) {
    for (const t of c.types || []) register(t, 'components', c.name);
  }

  return [...typeMap.entries()].map(([slug, used_in]) => ({ slug, used_in }));
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

module.exports = async function pull(cwd) {
  const appDir = path.join(cwd, 'app');
  const configDir = path.join(cwd, 'config');
  const outputFile = path.join(configDir, 'storylang.json');

  if (!fs.existsSync(appDir)) {
    throw new Error(
      `Could not find app/ directory at ${appDir}. ` +
      `Make sure you are running storylang from the root of your Ember project.`
    );
  }

  console.log('📖  storylang pull — scanning project files…\n');

  const components = buildComponents(appDir);
  const routes = buildRoutes(appDir);
  const services = buildServices(appDir);
  const helpers = buildHelpers(appDir);
  const modifiers = buildModifiers(appDir);
  const types = buildTypes(routes, components, services);

  // Merge with existing storylang.json so hand-written fields are preserved
  let existing = {};
  if (fs.existsSync(outputFile)) {
    try {
      existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
    } catch (_) {
      // corrupt file — start fresh
    }
  }

  const merged = {
    implementation_approach: existing.implementation_approach || '',
    types: mergeByKey(existing.types || [], types, 'slug'),
    components: mergeByKey(existing.components || [], components, 'name'),
    routes: mergeByKey(existing.routes || [], routes, 'name'),
    services: mergeByKey(existing.services || [], services, 'name'),
    helpers: mergeByKey(existing.helpers || [], helpers, 'name'),
    modifiers: mergeByKey(existing.modifiers || [], modifiers, 'name'),
  };

  if (!fs.existsSync(configDir)) fs.mkdirSync(configDir, { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(merged, null, 2) + '\n', 'utf8');

  console.log(`✅  config/storylang.json updated`);
  console.log(`    routes:     ${routes.length}`);
  console.log(`    components: ${components.length}`);
  console.log(`    services:   ${services.length}`);
  console.log(`    helpers:    ${helpers.length}`);
  console.log(`    modifiers:  ${modifiers.length}`);
  console.log(`    types:      ${types.length}`);
};

/**
 * Merge two arrays by a key, preferring scanned values for structural fields
 * but keeping existing hand-written description / implementation_approach fields.
 */
function mergeByKey(existing, scanned, key) {
  const existingMap = new Map(existing.map((e) => [e[key], e]));
  const scannedMap = new Map(scanned.map((s) => [s[key], s]));

  const allKeys = new Set([...existingMap.keys(), ...scannedMap.keys()]);
  const result = [];
  for (const k of allKeys) {
    const e = existingMap.get(k) || {};
    const s = scannedMap.get(k) || {};
    // scanned data wins for structural fields; preserve description from existing
    result.push({ ...s, description: e.description || s.description || '' });
  }
  return result;
}

'use strict';

/**
 * storylang push [--overwrite / -o]
 *
 * Reads config/storylang.json and generates missing (or all, when -o is set)
 * Ember project files: routes, controllers, components, services, helpers,
 * modifiers, and their corresponding templates where applicable.
 */

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Small utilities
// ---------------------------------------------------------------------------

function toPascalCase(str) {
  return str
    .split(/[-/]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join('');
}

function toCamelCase(str) {
  const pascal = toPascalCase(str);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

/**
 * Write a file only if it does not exist (or overwrite=true).
 * Returns true if the file was actually written.
 */
function writeFile(filePath, content, overwrite) {
  if (!overwrite && fs.existsSync(filePath)) return false;
  ensureDir(filePath);
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

// ---------------------------------------------------------------------------
// Template generators
// ---------------------------------------------------------------------------

/**
 * Route JS file
 */
function routeJs(def) {
  const className = toPascalCase(def.name) + 'Route';
  const services = def.services || [];
  const getVars = def.get_vars || [];
  const actions = def.actions || [];

  const serviceImports = services.length ? `import { service } from '@ember/service';\n` : '';
  const actionImport = actions.length ? `import { action } from '@ember/object';\n` : '';

  const serviceProps = services.map((s) => `  @service ${toCamelCase(s)};`).join('\n');

  const queryParamsBlock =
    getVars.length
      ? `\n  queryParams = {\n${getVars
          .map((v) => {
            const key = Object.keys(v)[0];
            return `    ${key}: { refreshModel: true },`;
          })
          .join('\n')}\n  };\n`
      : '';

  const modelArgs = getVars.length ? 'params' : '';
  const modelBody =
    getVars.length
      ? `    // TODO: use params to filter/paginate\n    // return await this.store.query('type-name', { page: { offset: 0, limit: 10 } });`
      : `    // TODO: return model data\n    // return await this.store.query('type-name', {});`;

  const actionMethods = actions
    .map(
      (a) =>
        `\n  @action\n  async ${a}() {\n    // TODO: implement ${a}\n  }`
    )
    .join('\n');

  return `import Route from '@ember/routing/route';
${serviceImports}${actionImport}
export default class ${className} extends Route {
${serviceProps ? serviceProps + '\n' : ''}${queryParamsBlock}
  async model(${modelArgs}) {
${modelBody}
  }
${actionMethods}
}
`;
}

/**
 * Controller JS file (minimal — logic lives in components)
 */
function controllerJs(def) {
  const className = toPascalCase(def.name) + 'Controller';
  return `import Controller from '@ember/controller';

export default class ${className} extends Controller {
  // Minimal controller — keep business logic in components and services.
}
`;
}

/**
 * Route HBS template
 */
function routeHbs(def) {
  const components = def.components || [];
  const inner = components.length
    ? components.map((c) => `  <${toPascalCase(c)} />`).join('\n')
    : '  {{outlet}}';
  return `<div class="route-${def.name}">\n${inner}\n</div>\n`;
}

/**
 * Component JS file
 */
function componentJs(def) {
  const className = toPascalCase(def.name) + 'Component';
  const trackedVars = def.tracked_vars || [];
  const actions = def.actions || [];
  const services = def.services || [];

  const hasTracked = trackedVars.length > 0;
  const hasActions = actions.length > 0;
  const hasServices = services.length > 0;

  const imports = [
    `import Component from '@glimmer/component';`,
    hasTracked ? `import { tracked } from '@glimmer/tracking';` : '',
    hasActions ? `import { action } from '@ember/object';` : '',
    hasServices ? `import { service } from '@ember/service';` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const serviceProps = services.map((s) => `  @service ${toCamelCase(s)};`).join('\n');
  const trackedProps = trackedVars
    .map((v) => {
      const [name, type] = Object.entries(v)[0];
      const defaultVal = defaultForType(type);
      return `  @tracked ${name} = ${defaultVal};`;
    })
    .join('\n');

  const actionMethods = actions
    .map(
      (a) =>
        `\n  @action\n  async ${a}() {\n    // TODO: implement ${a}\n  }`
    )
    .join('\n');

  return `${imports}

export default class ${className} extends Component {
${serviceProps ? serviceProps + '\n' : ''}${trackedProps ? trackedProps + '\n' : ''}${actionMethods}
}
`;
}

function defaultForType(type) {
  switch (type) {
    case 'bool': return 'false';
    case 'int': return '0';
    case 'array': return '[]';
    case 'object': return 'null';
    default: return 'null';
  }
}

/**
 * Component HBS template
 */
function componentHbs(def) {
  const type = def.type || 'component';
  const inheritedArgs = def.inherited_args || [];

  // Pick a sensible wrapper element/class based on component type
  const wrapperClass = bootstrapClass(type);
  const argDisplay = inheritedArgs
    .filter((a) => {
      const key = Object.keys(a)[0];
      const argType = Object.values(a)[0];
      return argType === 'var';
    })
    .map((a) => {
      const key = Object.keys(a)[0];
      return `  <p>{{@${key}}}</p>`;
    })
    .join('\n');

  return `<div class="${wrapperClass}">
${argDisplay || '  {{! TODO: add template content }}'}
</div>
`;
}

function bootstrapClass(type) {
  const map = {
    card: 'card',
    table: 'table-responsive',
    modal: 'modal',
    accordion: 'accordion',
    alert: 'alert',
    badge: 'badge',
    toast: 'toast',
    navbar: 'navbar navbar-expand-lg',
    nav: 'nav',
    tab: 'nav nav-tabs',
    breadcrumb: 'breadcrumb',
    'list-group': 'list-group',
    button: 'btn btn-primary',
    'button-group': 'btn-group',
    dropdown: 'dropdown',
    collapse: 'collapse',
    offcanvas: 'offcanvas',
    pagination: 'pagination',
    progress: 'progress',
    spinner: 'spinner-border',
  };
  return map[type] || 'container';
}

/**
 * Service JS file
 */
function serviceJs(def) {
  const className = toPascalCase(def.name) + 'Service';
  const trackedVars = def.tracked_vars || [];
  const actions = def.actions || [];
  const services = def.services || [];

  const hasTracked = trackedVars.length > 0;
  const hasActions = actions.length > 0;
  const hasServices = services.length > 0;

  const imports = [
    `import Service from '@ember/service';`,
    hasTracked ? `import { tracked } from '@glimmer/tracking';` : '',
    hasActions ? `import { action } from '@ember/object';` : '',
    hasServices ? `import { service } from '@ember/service';` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const serviceProps = services.map((s) => `  @service ${toCamelCase(s)};`).join('\n');
  const trackedProps = trackedVars
    .map((v) => {
      const [name, type] = Object.entries(v)[0];
      return `  @tracked ${name} = ${defaultForType(type)};`;
    })
    .join('\n');

  const actionMethods = actions
    .map(
      (a) =>
        `\n  async ${a}() {\n    // TODO: implement ${a}\n  }`
    )
    .join('\n');

  return `${imports}

export default class ${className} extends Service {
${serviceProps ? serviceProps + '\n' : ''}${trackedProps ? trackedProps + '\n' : ''}${actionMethods}
}
`;
}

/**
 * Helper JS file
 */
function helperJs(def) {
  const fnName = toCamelCase(def.name);
  const argNames = (def.args || []).map((a) => Object.keys(a)[0]);
  const positional = argNames.length ? `[${argNames.join(', ')}]` : '[]';
  const description = def.description ? `// ${def.description}\n` : '';

  return `import { helper } from '@ember/component/helper';

${description}export default helper(function ${fnName}(${positional}/*, namedArgs*/) {
  // TODO: implement ${def.name}
  return '';
});
`;
}

/**
 * Modifier JS file
 */
function modifierJs(def) {
  const argNames = (def.args || []).map((a) => Object.keys(a)[0]);
  const positional = argNames.length ? `[${argNames.join(', ')}]` : '[]';
  const services = def.services || [];
  const description = def.description ? `// ${def.description}\n` : '';
  const serviceImports = services.length ? `import { service } from '@ember/service';\n` : '';

  return `import { modifier } from 'ember-modifier';
${serviceImports}
${description}export default modifier((element, ${positional}/*, namedArgs*/) => {
  // TODO: implement ${def.name} modifier

  return () => {
    // cleanup
  };
});
`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

module.exports = async function push(cwd, { overwrite = false } = {}) {
  const configFile = path.join(cwd, 'config', 'storylang.json');

  if (!fs.existsSync(configFile)) {
    throw new Error(
      `config/storylang.json not found at ${configFile}.\n` +
      `Run "storylang pull" first, or create config/storylang.json manually.`
    );
  }

  let spec;
  try {
    spec = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  } catch (e) {
    throw new Error(`Failed to parse config/storylang.json: ${e.message}`);
  }

  const appDir = path.join(cwd, 'app');
  const mode = overwrite ? '(overwrite mode)' : '(skip existing)';
  console.log(`🚀  storylang push ${mode}\n`);

  const stats = { written: 0, skipped: 0 };

  function write(filePath, content) {
    const wrote = writeFile(filePath, content, overwrite);
    if (wrote) {
      console.log(`  ✔  ${path.relative(cwd, filePath)}`);
      stats.written++;
    } else {
      console.log(`  –  ${path.relative(cwd, filePath)} (skipped — already exists)`);
      stats.skipped++;
    }
  }

  // ── Routes ──────────────────────────────────────────────────────────────
  if (spec.routes && spec.routes.length) {
    console.log('Routes:');
    for (const def of spec.routes) {
      if (!def.name) continue;
      write(path.join(appDir, 'routes', `${def.name}.js`), routeJs(def));
      write(path.join(appDir, 'controllers', `${def.name}.js`), controllerJs(def));
      write(path.join(appDir, 'templates', `${def.name}.hbs`), routeHbs(def));
    }
  }

  // ── Components ──────────────────────────────────────────────────────────
  if (spec.components && spec.components.length) {
    console.log('\nComponents:');
    for (const def of spec.components) {
      if (!def.name) continue;
      write(path.join(appDir, 'components', `${def.name}.js`), componentJs(def));
      write(path.join(appDir, 'components', `${def.name}.hbs`), componentHbs(def));
    }
  }

  // ── Services ─────────────────────────────────────────────────────────────
  if (spec.services && spec.services.length) {
    console.log('\nServices:');
    for (const def of spec.services) {
      if (!def.name) continue;
      write(path.join(appDir, 'services', `${def.name}.js`), serviceJs(def));
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  if (spec.helpers && spec.helpers.length) {
    console.log('\nHelpers:');
    for (const def of spec.helpers) {
      if (!def.name) continue;
      write(path.join(appDir, 'helpers', `${def.name}.js`), helperJs(def));
    }
  }

  // ── Modifiers ────────────────────────────────────────────────────────────
  if (spec.modifiers && spec.modifiers.length) {
    console.log('\nModifiers:');
    for (const def of spec.modifiers) {
      if (!def.name) continue;
      write(path.join(appDir, 'modifiers', `${def.name}.js`), modifierJs(def));
    }
  }

  console.log(`\n✅  Done — ${stats.written} file(s) written, ${stats.skipped} skipped.`);
};

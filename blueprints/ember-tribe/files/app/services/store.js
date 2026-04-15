import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import ENV from '<%= dasherizedPackageName %>/config/environment';
import { TrackedArray, TrackedObject } from 'tracked-built-ins';

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Convert a camelCase or dasherized string to snake_case.
 */
function underscore(str) {
  return str
    .replace(/::/g, '/')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
}

/**
 * Convert snake_case or dasherized to camelCase.
 */
function camelize(str) {
  return str
    .replace(/[-_](.)/g, (_, c) => c.toUpperCase())
    .replace(/^(.)/, (_, c) => c.toLowerCase());
}

/**
 * Convert between model name representations:
 *   'blogPost' | 'blog-post' | 'blog_post'  →  canonical snake_case 'blog_post'
 */
function normalizeType(type) {
  if (!type) return '';
  return underscore(String(type).replace(/-/g, '_'));
}

/**
 * Dasherize for path segments: 'blog_post' → 'blog-post'
 */
function dasherize(str) {
  return underscore(str).replace(/_/g, '-');
}

// ---------------------------------------------------------------------------
// RecordArray — a tracked array-like that also carries `.meta`
// ---------------------------------------------------------------------------

class RecordArray {
  @tracked _records;
  @tracked meta;

  constructor(records = [], meta = {}) {
    this._records = new TrackedArray(records);
    this.meta = meta;
  }

  // MutableArray compat
  get length() { return this._records.length; }

  objectAt(idx) { return this._records[idx]; }

  forEach(fn) { this._records.forEach(fn); }
  map(fn) { return this._records.map(fn); }
  filter(fn) { return this._records.filter(fn); }
  find(fn) { return this._records.find(fn); }
  reduce(fn, init) { return this._records.reduce(fn, init); }
  some(fn) { return this._records.some(fn); }
  every(fn) { return this._records.every(fn); }
  includes(r) { return this._records.includes(r); }
  indexOf(r) { return this._records.indexOf(r); }
  slice(...a) { return this._records.slice(...a); }
  toArray() { return [...this._records]; }
  get firstObject() { return this._records[0]; }
  get lastObject() { return this._records[this._records.length - 1]; }

  push(record) { this._records.push(record); }
  pushObject(record) { this._records.push(record); }
  removeObject(record) {
    const idx = this._records.indexOf(record);
    if (idx !== -1) this._records.splice(idx, 1);
  }

  /** ES iterator support — allows `for...of` and spread. */
  [Symbol.iterator]() { return this._records[Symbol.iterator](); }

  /** Internal: wholesale replace content. */
  _replace(records, meta) {
    this._records.splice(0, this._records.length, ...records);
    if (meta !== undefined) this.meta = meta;
  }
}

// ---------------------------------------------------------------------------
// Record — a reactive proxy object representing a single resource
// ---------------------------------------------------------------------------

let _nextClientId = 1;

class Record {
  // ---- internal bookkeeping (not enumerable) ----
  @tracked _type;
  @tracked _id;
  @tracked _clientId;
  @tracked _attributes;      // TrackedObject of current attrs
  @tracked _originalAttrs;   // snapshot at last clean state
  @tracked _relationships;   // TrackedObject { key: id | [ids] }
  @tracked _errors;          // TrackedArray
  @tracked _isNew;
  @tracked _isDeleted;
  @tracked _isSaving;
  @tracked _store;           // back-reference

  constructor(store, type, id, attributes = {}, relationships = {}, isNew = false) {
    this._store = store;
    this._type = type;
    this._id = id;
    this._clientId = `client-${_nextClientId++}`;
    this._attributes = new TrackedObject({ ...attributes });
    this._originalAttrs = { ...attributes };
    this._relationships = new TrackedObject({ ...relationships });
    this._errors = new TrackedArray([]);
    this._isNew = isNew;
    this._isDeleted = false;
    this._isSaving = false;

    // Return a Proxy so arbitrary attribute access works: record.title, record.slug, etc.
    return new Proxy(this, {
      get(target, prop, receiver) {
        // Prioritise explicit Record properties / methods
        if (prop in target || typeof prop === 'symbol') {
          return Reflect.get(target, prop, receiver);
        }
        // Relationship?
        const schema = store._schemaFor(type);
        if (schema && schema.relationships && schema.relationships[prop]) {
          return target._resolveRelationship(prop);
        }
        // Attribute?
        if (target._attributes && prop in target._attributes) {
          return target._attributes[prop];
        }
        return undefined;
      },

      set(target, prop, value) {
        if (prop in target || typeof prop === 'symbol' || prop.startsWith('_')) {
          target[prop] = value;
          return true;
        }
        // Relationship?
        const schema = store._schemaFor(type);
        if (schema && schema.relationships && schema.relationships[prop]) {
          target._setRelationship(prop, value);
          return true;
        }
        // Attribute
        target._attributes[prop] = value;
        return true;
      },

      has(target, prop) {
        if (prop in target) return true;
        if (target._attributes && prop in target._attributes) return true;
        return false;
      },

      ownKeys(target) {
        const attrKeys = target._attributes ? Object.keys(target._attributes) : [];
        return [...new Set([...Reflect.ownKeys(target), ...attrKeys])];
      },

      getOwnPropertyDescriptor(target, prop) {
        if (target._attributes && prop in target._attributes) {
          return { configurable: true, enumerable: true, value: target._attributes[prop] };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
      },
    });
  }

  // ---- public computed-style accessors ----
  get id() { return this._id; }
  set id(v) { this._id = v; }

  get isNew() { return this._isNew; }
  get isDeleted() { return this._isDeleted; }
  get isSaving() { return this._isSaving; }
  get errors() { return this._errors; }

  get hasDirtyAttributes() {
    const keys = new Set([
      ...Object.keys(this._attributes),
      ...Object.keys(this._originalAttrs),
    ]);
    for (const k of keys) {
      if (this._attributes[k] !== this._originalAttrs[k]) return true;
    }
    return false;
  }

  changedAttributes() {
    const diff = {};
    const keys = new Set([
      ...Object.keys(this._attributes),
      ...Object.keys(this._originalAttrs),
    ]);
    for (const k of keys) {
      if (this._attributes[k] !== this._originalAttrs[k]) {
        diff[k] = [this._originalAttrs[k], this._attributes[k]];
      }
    }
    return diff;
  }

  rollbackAttributes() {
    for (const k of Object.keys(this._attributes)) {
      if (!(k in this._originalAttrs)) {
        delete this._attributes[k];
      }
    }
    for (const [k, v] of Object.entries(this._originalAttrs)) {
      this._attributes[k] = v;
    }
    if (this._isNew) {
      this._store._unloadRecord(this);
    }
    this._isDeleted = false;
    this._errors.splice(0, this._errors.length);
  }

  // ---- persistence ----

  async save() {
    this._isSaving = true;
    this._errors.splice(0, this._errors.length);
    try {
      if (this._isDeleted) {
        await this._store._deleteRemote(this);
        this._store._unloadRecord(this);
      } else if (this._isNew) {
        await this._store._createRemote(this);
        this._isNew = false;
      } else {
        await this._store._updateRemote(this);
      }
      // Snapshot clean state
      this._originalAttrs = { ...this._attributes };
    } finally {
      this._isSaving = false;
    }
    return this;
  }

  deleteRecord() {
    this._isDeleted = true;
  }

  async destroyRecord() {
    this.deleteRecord();
    return this.save();
  }

  // ---- relationships (resolved lazily) ----

  _resolveRelationship(name) {
    const schema = this._store._schemaFor(this._type);
    const rel = schema.relationships[name];
    const raw = this._relationships[name];

    if (rel.kind === 'belongsTo') {
      if (!raw) return null;
      // Return a promise that resolves to the related record
      const relType = rel.type;
      const cached = this._store.peekRecord(relType, raw);
      if (cached) return Promise.resolve(cached);
      return this._store.findRecord(relType, raw);
    }

    // hasMany — return a promise resolving to a RecordArray
    const ids = Array.isArray(raw) ? raw : [];
    const loaded = ids
      .map((rid) => this._store.peekRecord(rel.type, rid))
      .filter(Boolean);
    if (loaded.length === ids.length) {
      return Promise.resolve(new RecordArray(loaded));
    }
    // Fetch any missing
    return Promise.all(
      ids.map((rid) => {
        const cached = this._store.peekRecord(rel.type, rid);
        return cached ? cached : this._store.findRecord(rel.type, rid);
      }),
    ).then((records) => new RecordArray(records));
  }

  _setRelationship(name, value) {
    const schema = this._store._schemaFor(this._type);
    const rel = schema.relationships[name];

    if (rel.kind === 'belongsTo') {
      if (value === null) {
        this._relationships[name] = null;
      } else {
        this._relationships[name] = value._id ?? value.id ?? value;
      }
    } else {
      // hasMany — accept array of records or ids
      if (Array.isArray(value)) {
        this._relationships[name] = value.map((v) => v._id ?? v.id ?? v);
      }
    }
  }

  // Serialise for the network
  toJSON() {
    return { ...this._attributes };
  }
}

// ---------------------------------------------------------------------------
// Store Service
// ---------------------------------------------------------------------------

export default class StoreService extends Service {
  // Identity map: Map<normalizedType, Map<id, Record>>
  _cache = new Map();

  // Live arrays returned by peekAll (kept in sync)
  _liveArrays = new Map();

  // Schema registry derived from the Tribe blueprint
  // Map<normalizedType, { attributes: { slug: varType }, relationships: { slug: { kind, type, inverse } } }>
  _schemas = new Map();

  // Metadata cache per type (from last server response)
  _meta = new Map();

  // Base networking config (mirrors the old adapter)
  get _host() { return ENV.TribeENV.API_URL; }
  get _namespace() { return 'api.php'; }
  get _headers() {
    return {
      Authorization: `Bearer ${ENV.TribeENV.API_KEY}`,
      'Content-Type': 'application/json',
      Accept: 'application/vnd.api+json',
    };
  }

  // ===========================================================================
  // Schema / Blueprint
  // ===========================================================================

  /**
   * Must be called once at boot (the `types` service can invoke this).
   * Parses the Tribe webapp blueprint and registers schemas.
   */
  loadBlueprint(webappPayload) {
    if (!webappPayload || !webappPayload.modules) return;

    for (const [typeSlug, typeData] of Object.entries(webappPayload.modules)) {
      if (
        typeSlug === 'webapp' ||
        typeSlug === 'deleted_record' ||
        typeSlug === 'platform_record' ||
        typeSlug === 'blueprint_record' ||
        typeSlug === 'file_record' ||
        typeSlug === 'apikey_record' ||
        !typeData.modules ||
        !Array.isArray(typeData.modules)
      ) {
        continue;
      }

      const attributes = {};
      const relationships = {};

      typeData.modules.forEach((mod) => {
        const slug = mod.input_slug;
        if (mod.linked_type) {
          // This field is a relationship
          const relType = normalizeType(mod.linked_type);
          const kind = mod.var_type === 'array' || mod.var_type === 'has_many' ? 'hasMany' : 'belongsTo';
          relationships[slug] = { kind, type: relType, inverse: mod.inverse ?? null };
        } else {
          attributes[slug] = mod.var_type ?? 'string';
        }
      });

      this._schemas.set(normalizeType(typeSlug), { attributes, relationships });
    }
  }

  /**
   * Register a schema manually (for types not in the blueprint).
   */
  registerSchema(type, schema) {
    this._schemas.set(normalizeType(type), schema);
  }

  _schemaFor(type) {
    return this._schemas.get(normalizeType(type)) || null;
  }

  // ===========================================================================
  // URL building
  // ===========================================================================

  _urlForType(type) {
    return `${this._host}/${this._namespace}/${underscore(normalizeType(type))}`;
  }

  _urlForRecord(type, id) {
    return `${this._urlForType(type)}/${id}`;
  }

  // ===========================================================================
  // Network helpers
  // ===========================================================================

  async _fetch(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: { ...this._headers, ...(options.headers || {}) },
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const err = new Error(`HTTP ${res.status}`);
      err.status = res.status;
      err.payload = body;
      throw err;
    }

    // 204 No Content (typical for DELETE)
    if (res.status === 204) return null;
    return res.json();
  }

  // ===========================================================================
  // JSON:API normalisation (response → internal)
  // ===========================================================================

  /**
   * Normalise a JSON:API document and push all resources into the cache.
   * Also handles raw (non-JSON:API) responses from the Tribe API by wrapping
   * them into a JSON:API resource on the fly.
   *
   * @param {Object}  payload       The parsed JSON body from the server.
   * @param {string}  [contextType] The model type the caller requested (used
   *                                to wrap raw responses that lack a `data` key).
   * @param {string}  [contextId]   The id the caller requested.
   * @returns {{ data: Record|Record[]|null, meta: Object }}
   */
  _normalizeAndPush(payload, contextType, contextId) {
    if (!payload) return { data: null, meta: {} };

    // -------------------------------------------------------------------
    // Detect whether this is a JSON:API envelope or a raw Tribe response.
    // JSON:API always has a top-level `data` key (object or array).
    // If it's missing, treat the entire payload as a single raw resource.
    // -------------------------------------------------------------------
    if (!('data' in payload)) {
      // Raw response — wrap it into JSON:API shape.
      // `contextType` tells us what type was requested.
      if (!contextType) {
        // If we truly don't know the type, return the raw object as attributes
        // on a best-effort basis.
        return { data: payload, meta: payload.meta || {} };
      }

      const id = contextId ?? payload.id ?? payload.slug ?? '0';
      const { id: _discardId, meta, ...attrs } = payload;

      const wrapped = {
        data: {
          id: String(id),
          type: normalizeType(contextType),
          attributes: attrs,
        },
        meta: meta || {},
      };
      return this._normalizeAndPush(wrapped, contextType, contextId);
    }

    // -------------------------------------------------------------------
    // Standard JSON:API path
    // -------------------------------------------------------------------
    const meta = payload.meta || {};

    // Side-load included resources first
    if (Array.isArray(payload.included)) {
      payload.included.forEach((resource) => this._pushResource(resource));
    }

    let data;
    if (Array.isArray(payload.data)) {
      data = payload.data
        .filter((r) => r && r.type)           // skip malformed entries
        .map((r) => this._pushResource(r));
    } else if (payload.data && payload.data.type) {
      data = this._pushResource(payload.data);
    } else if (payload.data && contextType) {
      // `data` exists but has no `type` — inject it from context
      payload.data.type = normalizeType(contextType);
      if (!payload.data.id && contextId != null) payload.data.id = String(contextId);
      data = this._pushResource(payload.data);
    } else {
      data = null;
    }

    return { data, meta };
  }

  /**
   * Push a single JSON:API resource object into the identity map.
   */
  _pushResource(resource) {
    const type = normalizeType(resource.type);
    const id = String(resource.id);

    // Deserialise attributes (snake_case → camelCase keys kept as-is;
    // the Tribe API already uses snake_case which matches model slugs)
    const attrs = {};
    if (resource.attributes) {
      for (const [k, v] of Object.entries(resource.attributes)) {
        attrs[k] = v;
      }
    }

    // Deserialise relationships → store ids
    const rels = {};
    if (resource.relationships) {
      for (const [k, v] of Object.entries(resource.relationships)) {
        if (v.data === null || v.data === undefined) {
          rels[k] = null;
        } else if (Array.isArray(v.data)) {
          rels[k] = v.data.map((d) => String(d.id));
        } else {
          rels[k] = String(v.data.id);
        }
      }
    }

    // Upsert into identity map
    const existing = this._peekById(type, id);
    if (existing) {
      // Merge into existing record (preserves object identity)
      Object.assign(existing._attributes, attrs);
      existing._originalAttrs = { ...existing._attributes };
      Object.assign(existing._relationships, rels);
      existing._isNew = false;
      return existing;
    }

    const record = new Record(this, type, id, attrs, rels, false);
    this._cacheRecord(record);
    return record;
  }

  // ===========================================================================
  // JSON:API serialisation (internal → request payload)
  // ===========================================================================

  _serialise(record) {
    const type = normalizeType(record._type);
    const schema = this._schemaFor(type);

    const attributes = {};
    for (const [k, v] of Object.entries(record._attributes)) {
      // Use underscore keys on the wire (matches existing serialiser)
      attributes[underscore(k)] = v;
    }

    const relationships = {};
    if (schema && schema.relationships) {
      for (const [k, rel] of Object.entries(schema.relationships)) {
        const raw = record._relationships[k];
        if (raw === undefined) continue;
        if (rel.kind === 'belongsTo') {
          relationships[underscore(k)] = {
            data: raw ? { type: underscore(rel.type), id: String(raw) } : null,
          };
        } else {
          relationships[underscore(k)] = {
            data: (Array.isArray(raw) ? raw : []).map((rid) => ({
              type: underscore(rel.type),
              id: String(rid),
            })),
          };
        }
      }
    }

    const payload = {
      data: {
        type: underscore(type),
        attributes,
      },
    };

    if (record._id) payload.data.id = String(record._id);
    if (Object.keys(relationships).length) payload.data.relationships = relationships;

    return payload;
  }

  // ===========================================================================
  // Cache primitives
  // ===========================================================================

  _cacheRecord(record) {
    const type = normalizeType(record._type);
    if (!this._cache.has(type)) this._cache.set(type, new Map());
    this._cache.get(type).set(String(record._id ?? record._clientId), record);

    // Update live array
    const live = this._liveArrays.get(type);
    if (live && !live.includes(record)) {
      live.push(record);
    }
  }

  _peekById(type, id) {
    const bucket = this._cache.get(normalizeType(type));
    return bucket ? bucket.get(String(id)) || null : null;
  }

  _unloadRecord(record) {
    const type = normalizeType(record._type);
    const bucket = this._cache.get(type);
    if (bucket) {
      bucket.delete(String(record._id ?? record._clientId));
    }
    const live = this._liveArrays.get(type);
    if (live) live.removeObject(record);
  }

  // ===========================================================================
  // CRUD — remote operations (called by Record.save())
  // ===========================================================================

  async _createRemote(record) {
    const url = this._urlForType(record._type);
    const payload = this._serialise(record);
    const json = await this._fetch(url, { method: 'POST', body: JSON.stringify(payload) });
    if (json) {
      const { data } = this._normalizeAndPush(json, record._type);
      // The server may assign an id
      if (data && data._id) {
        // Re-key in cache
        const type = normalizeType(record._type);
        const bucket = this._cache.get(type);
        if (bucket) {
          bucket.delete(record._clientId);
        }
        record._id = data._id;
        this._cacheRecord(record);
      }
    }
  }

  async _updateRemote(record) {
    const url = this._urlForRecord(record._type, record._id);
    const payload = this._serialise(record);
    const json = await this._fetch(url, { method: 'PATCH', body: JSON.stringify(payload) });
    if (json) this._normalizeAndPush(json, record._type, record._id);
  }

  async _deleteRemote(record) {
    const url = this._urlForRecord(record._type, record._id);
    await this._fetch(url, { method: 'DELETE' });
  }

  // ===========================================================================
  // Public API — Finding Records
  // ===========================================================================

  /**
   * store.findRecord('post', 1)              → GET /api.php/post/1
   * store.findRecord('post', 1, { include: 'comments' })
   */
  async findRecord(type, id, options = {}) {
    let url = this._urlForRecord(type, id);
    const params = this._buildQueryParams(options);
    if (params) url += `?${params}`;
    const json = await this._fetch(url);
    const { data, meta } = this._normalizeAndPush(json, type, id);
    if (meta) this._meta.set(normalizeType(type), meta);
    return data;
  }

  /**
   * store.peekRecord('post', 1)  → from cache only, no network
   */
  peekRecord(type, id) {
    return this._peekById(type, id);
  }

  /**
   * store.findAll('post')              → GET /api.php/post
   * store.findAll('post', { include: 'comments' })
   */
  async findAll(type, options = {}) {
    let url = this._urlForType(type);
    const params = this._buildQueryParams(options);
    if (params) url += `?${params}`;
    const json = await this._fetch(url);
    const { data, meta } = this._normalizeAndPush(json, type);
    const records = Array.isArray(data) ? data : data ? [data] : [];
    // Update or create live array
    const nType = normalizeType(type);
    let live = this._liveArrays.get(nType);
    if (!live) {
      live = new RecordArray(records, meta);
      this._liveArrays.set(nType, live);
    } else {
      live._replace(records, meta);
    }
    return live;
  }

  /**
   * store.peekAll('post')  → RecordArray from cache, no network
   */
  peekAll(type) {
    const nType = normalizeType(type);
    if (!this._liveArrays.has(nType)) {
      const bucket = this._cache.get(nType);
      const records = bucket ? [...bucket.values()] : [];
      this._liveArrays.set(nType, new RecordArray(records));
    }
    return this._liveArrays.get(nType);
  }

  /**
   * store.query('person', { filter: { name: 'Peter' } })
   */
  async query(type, params = {}) {
    let url = this._urlForType(type);
    const qs = this._buildQueryParams(params);
    if (qs) url += `?${qs}`;
    const json = await this._fetch(url);
    const { data, meta } = this._normalizeAndPush(json, type);
    const records = Array.isArray(data) ? data : data ? [data] : [];
    return new RecordArray(records, meta);
  }

  /**
   * store.queryRecord('user', { ... })  → returns a single record
   */
  async queryRecord(type, params = {}) {
    let url = this._urlForType(type);
    const qs = this._buildQueryParams(params);
    if (qs) url += `?${qs}`;
    const json = await this._fetch(url);
    const { data, meta } = this._normalizeAndPush(json, type);
    if (Array.isArray(data)) return data[0] || null;
    return data;
  }

  // ===========================================================================
  // Public API — Creating Records
  // ===========================================================================

  /**
   * store.createRecord('post', { title: 'Hello', body: '...' })
   */
  createRecord(type, attrs = {}) {
    const nType = normalizeType(type);
    const schema = this._schemaFor(nType);

    // Separate relationships from plain attributes
    const plainAttrs = {};
    const rels = {};

    for (const [k, v] of Object.entries(attrs)) {
      if (schema && schema.relationships && schema.relationships[k]) {
        // Accept a record or an id
        const rel = schema.relationships[k];
        if (rel.kind === 'belongsTo') {
          rels[k] = v && typeof v === 'object' ? (v._id ?? v.id ?? v) : v;
        } else {
          rels[k] = Array.isArray(v) ? v.map((r) => (r && typeof r === 'object' ? (r._id ?? r.id ?? r) : r)) : v;
        }
      } else {
        plainAttrs[k] = v;
      }
    }

    const record = new Record(this, nType, null, plainAttrs, rels, true);
    this._cacheRecord(record);
    return record;
  }

  // ===========================================================================
  // Public API — Pushing Records
  // ===========================================================================

  /**
   * store.push(jsonApiDocument)
   * Accepts a JSON:API-shaped document with `data` (and optional `included`).
   */
  push(jsonApiDoc) {
    const { data } = this._normalizeAndPush(jsonApiDoc);
    return data;
  }

  /**
   * store.pushPayload(rawPayload)
   * Accepts a REST-style payload keyed by type name, normalises to JSON:API, and pushes.
   * Example: { posts: [{ id: 1, title: '...' }] }
   */
  pushPayload(rawPayload) {
    const resources = [];
    for (const [key, items] of Object.entries(rawPayload)) {
      const type = normalizeType(key);
      const list = Array.isArray(items) ? items : [items];
      for (const item of list) {
        const { id, ...attrs } = item;
        resources.push({ id: String(id), type, attributes: attrs });
      }
    }
    return this.push({ data: resources });
  }

  // ===========================================================================
  // Public API — Unload
  // ===========================================================================

  unloadRecord(record) {
    this._unloadRecord(record);
  }

  unloadAll(type) {
    if (type) {
      const nType = normalizeType(type);
      this._cache.delete(nType);
      const live = this._liveArrays.get(nType);
      if (live) live._replace([]);
    } else {
      this._cache.clear();
      this._liveArrays.forEach((live) => live._replace([]));
    }
  }

  // ===========================================================================
  // Public API — Metadata
  // ===========================================================================

  /**
   * store.metadataFor('post')  → last meta received for this type
   */
  metadataFor(type) {
    return this._meta.get(normalizeType(type)) || {};
  }

  // ===========================================================================
  // Query-param builder
  // ===========================================================================

  _buildQueryParams(options) {
    if (!options || typeof options !== 'object') return '';
    const parts = [];

    const serialize = (obj, prefix) => {
      for (const [k, v] of Object.entries(obj)) {
        const key = prefix ? `${prefix}[${k}]` : k;
        if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
          serialize(v, key);
        } else {
          parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
        }
      }
    };

    serialize(options);
    return parts.join('&');
  }
}

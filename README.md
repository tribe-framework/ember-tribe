# ember-tribe

An addon that connects EmberJS to Tribe API, bridging the gap between backend data structures and frontend application development. It helps you make an Ember app based on Junction's Blueprint file, also called `types.json`.

Tribe is a project management framework built for ease of collaboration - https://github.com/tribe-framework/tribe

---

## Table of Contents

- [Installation and Setup](#installation-and-setup)
- [Folder Structure](#folder-structure)
- [Best Practices for AI Generated Code](#best-practices-for-ai-generated-code)
  - [Code Rules](#code-rules)
  - [Storylang Rules](#storylang-rules)
    - [Types](#types)
    - [Routes](#routes)
    - [Controllers](#controllers)
    - [Helpers](#helpers)
    - [Modifiers](#modifiers)
    - [Services](#services)
    - [Components](#components)
- [Storylang](#storylang)
  - [Storylang CLI](#storylang-cli)
  - [Storylang.json Documentation](#storylangjson-documentation)
    - [Types](#1-types)
    - [Routes](#2-routes)
    - [Helpers](#3-helpers)
    - [Modifiers](#4-modifiers)
    - [Services](#5-services)
    - [Components](#6-components)
    - [Data Types Reference](#data-types-reference)
    - [Integration with Other Files](#integration-with-other-files)
- [EmberJS](#emberjs)
  - [Ember-Tribe Development Guide](#ember-tribe-development-guide)
    - [EmberData Integration](#emberdata-integration)
    - [Route Generation](#route-generation)
    - [Helper System](#helper-system)
    - [Modifier System](#modifier-system)
    - [Services Integration](#services-integration)
    - [Component Architecture](#component-architecture)
    - [Forms and Input Fields](#forms-and-input-fields)
  - [Deploying to Junction (Self-Hosted)](#deploying-to-junction-self-hosted)

---

## Installation and Setup

### Prerequisites

- Ember CLI v6.0 – v6.4
- Node.js (latest LTS)
- Junction (optional) - via https://junction.express (cloud version) or https://tribe-framework.org (open source version)

### Installation

```bash
ember install ember-tribe
```

- Enter `TRIBE_API_URL` and `TRIBE_API_KEY` in `.env` file (copy of `.env.sample`). You can find these values in the Junction dashboard at [junction.express](https://junction.express) (cloud) or your self-hosted Tribe admin panel.

---

The addon automatically configures following essential packages:

**Ember Addons:** `ember-cli-dotenv`, `ember-cli-sass`, `ember-modifier`, `ember-composable-helpers`, `ember-truth-helpers`, `ember-file-upload` , `ember-power-select`

**NPM Packages:** `bootstrap`, `@popperjs/core`, `animate.css`, `video.js`, `swiper`,  `howler`, `sortablejs`, `papaparse`

**Built-in features that can be used in routes and components**:

- **Layout**: `table`, `figure`, `accordion`, `card`, `list-group`, `navbar`, `nav`, `tab`, `breadcrumb`
- **Interactive**: `button`, `button-group`, `dropdown`, `modal`, `collapse`, `offcanvas`, `pagination`, `popover`, `tooltip`, `swiper-carousel`, `videojs-player`, `howlerjs-player`, `input-field`, `input-group`, `textarea`, `checkbox`, `radio`, `range`, `select`, `multi-select`, `date`, `file-uploader`, `alert`, `badge`, `toast`, `placeholder`, `progress`, `spinner`, `scrollspy`

**Preinstalled services in ember-tribe**:

- `store`: Ember Data store for CRUD operations
- `router`: Ember router service for navigation
- `types`: Automatic model generation from backend tracks

---

## Folder Structure

```
app/
├── routes/
├── templates/
├── controllers/
├── components/
├── helpers/
├── modifiers/
├── services/
├── styles/app.scss
└── router.js
config/
└── storylang.json
installer.sh
```

---

## Best Practices for AI generated code

These rules are **mandatory** for all Tribe-compatible code. Follow them strictly and do not deviate unless explicitly instructed.

### Code Rules

1. **EmberJS 6.x Compatibility — Strictly Required**
   All generated code must be strictly compatible with EmberJS 6.x.

2. **Bootstrap 5.x — Required Foundation**
   Use Bootstrap 5.x as the sole design system for all layout, spacing, and responsive behaviour. Do not introduce custom CSS frameworks or utility libraries that conflict with Bootstrap. Follow Bootstrap conventions strictly.

3. **Backend Field Access**
   Always access backend fields through the `modules` object — e.g. `object.modules.field_name`. Never access backend fields directly.

4. **npm Packages over Ember Addons**
   When an npm package and an Ember addon offer equivalent functionality, always prefer the npm package for better long-term compatibility.

5. **Icons — FontAwesome 6.x Only**
   Use FontAwesome 6.x for all icons. Do not use any other icon library unless the project description explicitly specifies one.

6. **Animations — Subtle and Purposeful**
   If animations are needed, use `animate.css`. Keep animations subtle — prefer fades and minimal slides. Avoid anything that feels flashy or distracting.

7. **EmberData Caching**
   When data has already been loaded into the store, retrieve it with `peekRecord` instead of making a new network request.

8. **Backend Filtering over Frontend Filtering**
   For sorting and filtering data, always use `this.store.query` with backend query parameters. Do not filter or sort arrays on the frontend when the backend can do it.

---

### Storylang Rules

Follow this strict order of thinking when designing any feature:

> **Understand Types → Routes → Controllers → Helpers → Modifiers → Services → Components**

Always begin by understanding your data types, then define the routes that load that data, then wire up controllers to handle user actions, then extract reusable template logic into helpers, then isolate DOM behaviour into modifiers, then move app-wide logic into services, and finally — only when the project's scale warrants it — extract repeatable UI into components.

---

**Types**

8. **Start by Understanding Your Data**
    Before writing any code, read the project description and `types.json` to understand the data model. Every architectural decision that follows — which routes to create, which services to build, whether components are even needed — depends on a clear understanding of the underlying types.

---

**Routes**

9. **Route Naming**
   Match route names to user mental models. Use consistent, predictable naming conventions so that routes are self-documenting.

10. **Routes Are for Fetching, Not Logic**
   Routes should primarily perform read/fetch operations and pass data down to components or services. Keep JavaScript in routes to a minimum — business logic belongs in components and services, not routes.

11. **Route Parameters**
    Keep `get_vars` minimal and meaningful. Load only the data types that each specific route actually needs — avoid over-fetching.

---

**Controllers**

12. **Controllers Bridge Routes and Templates**
    Controllers sit between routes and templates, handling query parameters, user actions, and transient UI state that belongs to a specific route. Keep controllers focused — they are not a place for business logic or data fetching.

13. **Keep Controllers Thin**
    Delegate complex logic to services. A controller should primarily expose tracked properties and actions that the corresponding template needs directly.

---

**Helpers**

14. **Helpers Must Be Pure and Stateless**
    A helper receives input and returns output — nothing else. Helpers must have no side effects and must not interact with the store, services, or DOM.

---

**Modifiers**

15. **Modifiers Own All DOM Interaction**
    Any direct DOM manipulation or third-party library initialisation must live in a modifier.

---

**Services**

16. **Services Are the Core Logic Layer**
    Services hold the primary business logic of the application. They interact with both routes and components and are the single source of truth for app-wide behaviour.

17. **Keep Services Stateless When Possible**
    Avoid storing transient state in services. Where services must depend on one another, use dependency injection.

---

**Components**

18. **Components are not always required**
    Before creating components, assess the scale of the project from its description. On small projects, fewer files means higher code readability — collapsing template logic directly into route templates is often the right call. On larger projects, the opposite is true: extracting repeatable UI into named components improves clarity, maintainability, and testability. Make this decision deliberately at the start, not as an afterthought.

---

## Storylang

### Storylang CLI

ember-tribe ships with a command-line tool called `storylang` that synchronises the `config/storylang.json` specification with the actual Ember project files.

#### Usage

```bash
node storylang
```

Scans the current Ember project and writes/updates `config/storylang.json` from the actual files that exist in the `app/` directory.

**Example:**

```bash
cd /path/to/ember/app

node storylang
# => config/storylang.json updated from project files
```

#### Typical Workflow

Run `node storylang` periodically to keep `config/storylang.json` in sync as the project evolves.

---

### Storylang.json Documentation

#### Overview

Storylang.json is a structured configuration file used in the ember-tribe ecosystem to define the frontend implementation of your application. It is found at `config/storylang.json`. It works in conjunction with your `types.json` (which defines your data types) to create a complete frontend specification.

#### Purpose

The storylang.json file serves as a blueprint for frontend developers to understand:

- What routes, components, services, helpers, modifiers and types are required
- How data flows through the application

#### File Structure

The storylang.json file contains seven main sections:

```json
{
  "types": [...],
  "routes": [...],
  "helpers": [...],
  "modifiers": [...],
  "services": [...],
  "components": [...]
}
```

#### Section Definitions

#### 1. Types

**Purpose**: Declares which data types from `types.json` and maps them to the components, routes, services, helpers and modifiers that consume them. This creates a traceable link between your data layer and your UI implementation.

**Format**:

```json
{
  "types": [
    {
      "slug": "type-slug", //type slug as defined in `types.json` blueprint
      "used_in": { //where this type is used
        "routes": ["route-name"],
        "components": ["component-name"],
        "services": ["service-name"],
        "helpers": ["helper-name"],
        "modifiers": ["modifier-name"]
      }
    }
  ]
}
```

---

#### 2. Routes

**Purpose**: Defines the application's routes and their requirements.

> **Note on controllers**: In `storylang.json`, controllers are not listed as a separate top-level section. Instead, each controller is considered part of its corresponding route — just as a component's backing JavaScript class is part of its component entry. Controller actions, tracked variables, and query parameters should be specified within the route definition they belong to.

**Format**:

```json
{
  "routes": [
    {
      "name": "route-name", //should match Ember router.js
      "tracked_vars": [{ "<variableName>": "<dataType>" }],
      "get_vars": [{ "<paramName>": "<dataType>" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1"],
      "services": ["service1"],
      "components": ["component1", "component2"],
      "types": ["type1", "type2"]
    }
  ]
}
```

---

#### 3. Helpers

**Purpose**: Defines custom template helpers — pure functions used in templates to format, compute or transform data for display.

**Format**:

```json
{
  "helpers": [
    {
      "name": "helper-name",
      "description": "What this helper does",
      "input_args": [{ "<argumentName>": "<dataType>" }],
      "return": "<dataType>"
    }
  ]
}
```

**Example**:

```json
{
  "helpers": [
    {
      "name": "format-date",
      "description": "Formats a raw ISO date string into a human-readable date",
      "input_args": [{ "isoString": "string" }, { "format": "string" }],
      "return": "string"
    },
    {
      "name": "truncate-text",
      "description": "Truncates a string to a given character limit and appends an ellipsis",
      "input_args": [{ "text": "string" }, { "limit": "int" }],
      "return": "string"
    }
  ]
}
```

---

#### 4. Modifiers

**Purpose**: Defines custom Ember modifiers — functions that directly interact with DOM elements to attach behaviour, third-party libraries or event listeners.

**Format**:

```json
{
  "modifiers": [
    {
      "name": "modifier-name",
      "description": "What DOM behaviour this modifier applies",
      "input_args": [{ "<argumentName>": "<dataType>" }],
      "services": ["service1"]
    }
  ]
}
```

**Example**:

```json
{
  "modifiers": [
    {
      "name": "tooltip",
      "description": "Initialises a Bootstrap tooltip on the target element using the provided label",
      "input_args": [{ "label": "string" }, { "placement": "string" }],
      "services": []
    },
    {
      "name": "autofocus",
      "description": "Sets focus on the target element when it is inserted into the DOM",
      "input_args": [],
      "services": []
    }
  ]
}
```

---

#### 5. Services

**Purpose**: Defines custom Ember services needed by the application.

**Format**:

```json
{
  "services": [
    {
      "name": "service-name",
      "tracked_vars": [{ "<variableName>": "<dataType>" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1"],
      "services": ["dependency1", "dependency2"]
    }
  ]
}
```

**Example**:

```json
{
  "services": [
    {
      "name": "visualization-builder",
      "tracked_vars": [
        { "currentVisualization": "object" },
        { "availableTypes": "array" }
      ],
      "actions": [
        "createVisualization",
        "updateVisualization",
        "deleteVisualization"
      ],
      "helpers": ["validateConfig", "generatePreview"],
      "services": ["store", "router"]
    }
  ]
}
```

---

#### 6. Components

**Purpose**: Defines reusable UI components that will be built for the application.

**Format**:

```json
{
  "components": [
    {
      "name": "component-name",
      "type": "component-type",
      "tracked_vars": [{ "<variableName>": "<dataType>" }],
      "inherited_args": [{ "<argumentName>": "<argType>" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1", "helper2"],
      "modifiers": ["modifier1"],
      "services": ["service1", "service2"]
    }
  ]
}
```

**Example**:

```json
{
  "components": [
    {
      "name": "file-summary-card",
      "type": "card",
      "tracked_vars": [{ "isSelected": "bool" }, { "isExpanded": "bool" }],
      "inherited_args": [
        { "file": "var" },
        { "onEdit": "action" },
        { "onDelete": "action" }
      ],
      "actions": ["toggleSelection", "expandDetails", "editFile", "deleteFile"],
      "helpers": ["formatDate", "truncateText"],
      "modifiers": ["tooltip"],
      "services": ["store", "router"]
    }
  ]
}
```

---

#### Data Types Reference

#### Data Types (dataType)

- `string`: Text values
- `int`: Integer numbers
- `bool`: Boolean true/false
- `array`: List of items
- `object`: Complex data structure

#### Argument Types (argType)

- `var`: Passed data/state
- `fn`: Callback function
- `get`: Get function
- `action`: User interaction handler

---

#### Integration with Other Files

#### With types.json

- Type names used in routes should match type names from `types.json`
- The `types` section in storylang.json is the explicit bridge between your data types and your UI — always keep it in sync with `types.json`
- Types are the gateway to persistent storage on the backend
- For a full reference on the `types.json` format and its field definitions, see the official documentation at [https://github.com/tribe-framework/types.json](https://github.com/tribe-framework/types.json)

---

## EmberJS

### Ember-Tribe Development Guide

#### Required File Outputs

Make separate, complete code files for each category:

#### Example installer.sh

```bash
npm i chart.js
npm i lodash
ember install ember-table
ember g route files
ember g controller files
ember g component file-card -gc
ember g helper format-date
ember g modifier tooltip
ember g service visualization-builder
```

#### Default styling

Following is the default style that comes with tribe. Use the app.scss file for all style code. Change this based on your design styling requirements.

```app/styles/app.scss
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');

$font-family-sans-serif: 'IBM Plex Mono', monospace !default;
$display-font-family: 'IBM Plex Mono', monospace !default;

$primary: #000000 !default;
$secondary: #cccccc !default;
$success: #00ff00 !default;
$info: #0000ff !default;
$warning: #ffff00 !default;
$danger: #ff0000 !default;
$light: #eeeeee !default;
$dark: #333333 !default;

$enable-rounded: false !default;
$enable-negative-margins: true !default;
$enable-cssgrid: true !default;

$spacer: 1rem !default;
$spacers: (
  0: 0,
  1: $spacer * 0.25,
  2: $spacer * 0.5,
  3: $spacer,
  4: $spacer * 1.5,
  5: $spacer * 3,
  6: $spacer * 4.5,
  7: $spacer * 6,
  8: $spacer * 7.5,
  9: $spacer * 9,
  10: $spacer * 12,
) !default;

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/animate.css/animate';
```

#### Default application structure

```app/templates/application.hbs
{{page-title 'Your Application Name'}}
{{outlet}}
<BasicDropdownWormhole />
```

```app/routes/application.js
import Route from '@ember/routing/route';
import * as bootstrap from 'bootstrap';
import { service } from '@ember/service';
import { later } from '@ember/runloop';
import { action } from '@ember/object';

export default class ApplicationRoute extends Route {
  @service types;

  //auto-sync backend types
  async beforeModel() { await this.types.fetchAgain() }

  @action
  didTransition() { later( this, () => { document.querySelector('#loading').classList.add('d-none') }, 50 ) }

  @action
  willTransition() { document.querySelector('#loading').classList.remove('d-none') }
}
```

**Application Extension Guidelines:**

- Extend when adding global navigation components
- Include shared modals or dropdowns
- Add application-wide notification systems
- Insert global loading states or overlays

---

### EmberData Integration

ember-tribe automatically generates models from backend track definitions through the `types` service:

#### Data Access Patterns

EmberData operations always use a "modules" key for field access, except for `.id` and `.slug` properties. All field names from backend storage use underscore notation: `modules.any_field`.

```javascript
// Accessing track data
let post = await this.store.findRecord('post', 1);
console.log(post.id); // Direct property
console.log(post.slug); // Direct property
console.log(post.modules.title); // Field access
console.log(post.modules.content_privacy); // Universal field
```

#### Query Operations

```javascript
// Complex queries
this.store.query('post', {
  modules: { status: 'published' }, // AND conditions
  filter: { category: 'tech' }, // OR conditions
  sort: 'title,-created_date', // Sort (- for desc)
  page: { offset: 0, limit: 10 }, // Pagination
  show_public_objects_only: false, // Include drafts
});
```

#### `modules` vs `filter`: AND vs OR Queries

When querying records, `modules` and `filter` serve distinct purposes that map directly to how the backend constructs its SQL or query logic.

**`modules`** applies **AND** logic: every key-value pair in the object must match for a record to be included. Use this when you want to narrow results to records that simultaneously satisfy all of the given conditions — for example, posts that are both `published` and belong to a specific `author_id`.

**`filter`** applies **OR** logic: a record is included if it matches *any* of the key-value pairs. Use this when you want to broaden results across multiple values of a field — for example, items whose `category` is either `tech` or `design`.

The two can be combined in the same query. For instance, to find all published posts that are tagged as either `news` or `feature`:

```javascript
this.store.query('post', {
  modules: { status: 'published' }, // must be published
  filter: { tag: 'news', section: 'feature' }, // tagged news OR in feature section
});
```

Always prefer expressing these constraints via `modules` and `filter` over post-processing results in JavaScript — the backend handles this far more efficiently.

Smart use of EmberData can significantly reduce size of the codebase. Make sure you take advantage of that.

**Universal Default Module:**
All objects include: `"content_privacy": "string | public, private, pending, draft"`

**Single Record Operations:**

```javascript
// Find by ID or slug
this.store.findRecord('track', 30);
this.store.findRecord('track', 'some-slug-here');

// Access without network request (if already in store)
let post = this.store.peekRecord('post', 1);

// Usage pattern
this.store.findRecord('post', 1).then((post) => {
  // Access: post.id, post.slug, post.modules.<field_name>
});
```

**Multiple Records:**

```javascript
this.store
  .query('person', {
    modules: { name: 'Peter', location: 'delhi' }, //AND: both conditions must match
    /*
    filter: { name: 'Peter', location: 'delhi' } //OR: either condition can match
    sort: "location,-age,name", //minus for descending order of that field, default is -id
    page: { offset:0, limit:-1 }, //for pagination or smart uses, -1 means everything
    ignore_ids: [10,14] //excludes these IDs from results
    show_public_objects_only: false, //default = true, if set false results include content_privacy = drafts, private or pending
    */
  })
  .then((results) => {
    // Process results
  });
```

Prefer using backend (this.store.query) for search, filter and sort, over front-end JS functions to achieve the same thing. Avoid using this.store.findAll altogether, use this.store.query with page: { offset:0, limit:-1 } instead.

**CRUD Operations:**

```javascript
// Update
let post = await this.store.findRecord('post', 1);
post.modules.title = 'A new title';
await post.save(); // => PATCH request

// Delete
let post = this.store.peekRecord('post', 2);
post.destroyRecord(); // => DELETE request
```

---

### Route Generation

#### Route Creation

Make routes based on storylang.json route definitions:

```javascript
import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FilesRoute extends Route {
  @service store;

  queryParams = {
    page: { refreshModel: true },
    search: { refreshModel: true },
  };

  async model(params) {
    return await this.store.query('json_file', {
      page: { offset: (params.page - 1) * 10, limit: 10 },
      modules: params.search ? { title: params.search } : {},
    });
  }
}
```

---

### Helper System

#### Global Helpers

Make helpers based on storylang.json helper requirements:

```javascript
// app/helpers/format-date.js
import { helper } from '@ember/component/helper';

export default helper(function formatDate([date, format = 'short']) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: format,
  }).format(new Date(date));
});
```

#### Template Usage

```handlebars
<span class='text-muted'>
  {{format-date @post.modules.created_date 'medium'}}
</span>
```

---

### Modifier System

#### DOM Interaction Modifiers

Make modifiers for specific DOM manipulation needs:

```javascript
// app/modifiers/tooltip.js
import { modifier } from 'ember-modifier';
import { Tooltip } from 'bootstrap';

export default modifier((element, [content]) => {
  const tooltip = new Tooltip(element, {
    title: content,
  });

  return () => tooltip.dispose();
});
```

#### Writing Helpers

Helper functions are JavaScript functions callable from Ember templates that perform computations or operations beyond basic template syntax, keeping templates clean while adding dynamic functionality.

**Local Helpers:**

- Defined as methods within component classes
- Scoped to specific component
- Called with `this.` prefix in templates

```javascript
// app/components/user-card.js
export default class UserCard extends Component {
  formatName = (firstName, lastName) =>
    `${firstName} ${lastName}`.toUpperCase();
}
```

```handlebars
<!-- app/components/user-card.hbs -->
<h2>{{this.formatName @user.modules.first_name @user.modules.last_name}}</h2>
```

**Global Helpers:**

- Defined in `app/helpers/` folder as separate files
- Available across all application templates
- Called directly by function name

```javascript
// app/helpers/format-currency.js
export default function formatCurrency(amount, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
```

```handlebars
<span>{{format-currency @item.modules.price 'EUR'}}</span>
```

**Helper Features:**

- Support positional arguments: `{{helper arg1 arg2}}`
- Support named arguments: `{{helper arg1 key=value}}`
- Can be nested: `{{outer-helper (inner-helper @value)}}`
- Built-in helpers available: `{{get}}`, `{{concat}}`, `{{let}}`, `{{array}}`, `{{hash}}`

**Usage Guidelines:**

- Local: Component-specific logic, simple transformations
- Global: Reusable functionality across multiple components (formatting, calculations)

#### Component Architecture & Principle of Substitution

Ember components should be thought of as templates that re-execute from scratch whenever data changes. Write templates that produce correct output for any given input; Ember efficiently updates only what has changed.

**Template Patterns:**

```handlebars
<article title='{{@article.modules.title}}'>
  <header><h1>{{@article.modules.title}}</h1></header>
  <section>{{@article.modules.body}}</section>
</article>
```

**Dynamic Updates:**

- Text and Attributes: Use `{{}}` syntax for automatic DOM updates
- Conditional Logic: Use helpers for conditional attributes

```handlebars
<div class={{if @user.modules.is_admin 'superuser' 'standard'}}>
  Welcome to my app.
</div>
```

**Event Handling:**
Use `{{on}}` element modifier for event handlers:

```handlebars
<button type='button' {{on 'click' this.increment}}>+</button>
```

```javascript
import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CounterComponent extends Component {
  @tracked count = 0;

  @action
  increment() {
    this.count++;
  }
}
```

#### Component Communication & Modifiers

**Design Pattern:**

1. Component manages state
2. Modifiers handle DOM interactions
3. Separation enables better reusability and testing

**Complex Interaction Example:**

```handlebars
<audio src={{@song.modules.src_url}} {{play-when this.isPlaying}} />
<button type='button' {{on 'click' this.play}}>Play</button>
<button type='button' {{on 'click' this.pause}}>Pause</button>
```

```javascript
// Component manages state
@tracked isPlaying = false;

@action
play() {
  this.isPlaying = true;
}
```

```javascript
// Modifier handles DOM interaction
import { modifier } from 'ember-modifier';

export default modifier((element, [isPlaying]) => {
  if (isPlaying) {
    element.play();
  } else {
    element.pause();
  }
});
```

**Modifier Forwarding:**
Modifiers applied to components pass through via `...attributes`:

```handlebars
<Tooltip {{custom-modifier}} />
<!-- Forwards to: -->
<div ...attributes>...</div>
```

#### Services

Services are Ember objects that persist for the entire application duration, providing shared state or persistent connections across different parts of your app.

**Service Definition:**

```javascript
// app/services/shopping-cart.js
import { TrackedArray } from 'tracked-built-ins';
import Service from '@ember/service';

export default class ShoppingCartService extends Service {
  items = new TrackedArray([]);

  add(item) { this.items.push(item) }

  remove(item) { this.items.splice(this.items.indexOf(item), 1) }

  empty() { this.items.splice(0, this.items.length) }
}
```

**Service Access:**

```javascript
import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class CartContentsComponent extends Component {
  // Loads service from: app/services/shopping-cart.js
  @service shoppingCart;
}
```

---

### Services Integration

Make services based on storylang.json service definitions:

```javascript
// app/services/visualization-builder.js
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class VisualizationBuilderService extends Service {
  @service store;
  @tracked supportedTypes = ['network', 'tree', 'sankey'];

  buildVisualization(files, type, config) {
    // Service logic implementation
  }
}
```

---

### Component Architecture

#### Component Structure

```javascript
// Component class
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class FileCardComponent extends Component {
  @service store;
  @tracked isSelected = false;

  @action
  toggleSelection() {
    this.isSelected = !this.isSelected;
  }
}
```

#### Template Patterns

```handlebars
<div
  class='card {{if this.isSelected "border-primary"}}'
  {{on 'click' this.toggleSelection}}
>
  <div class='card-body'>
    <h5 class='card-title'>{{@file.modules.title}}</h5>
    <p class='card-text'>{{@file.modules.description}}</p>
  </div>
</div>
```

---

### Forms and Input Fields

#### File upload javascript example

```javascript
import ENV from '<your-application-name>/config/environment';

@action
async uploadFile(file) {
  try {
    const response = await file.upload(ENV.TribeENV.API_URL + '/uploads.php');
    response.json().then(async (data) => {
      if (data.status == 'success') {
        //data.file.name
        //data.file.mime
        //data.file.url
        //if mime type is an image, following converted sizes are also available
          //data.file.xl.url
          //data.file.lg.url
          //data.file.md.url
          //data.file.sm.url
          //data.file.xs.url
      } else if (data.status == 'error') {
        alert(data.error_message);
      }
    });
  } catch (error) {
    file.state = 'aborted';
  }
}
```

#### Input and Textarea fields

Use Ember's built-in `<Input>` component instead of a raw `<input>` tag — it automatically updates bound state via `@value`.

```handlebars
<div class="mb-3">
  <label for="input-name" class="form-label">Name:</label>
  <Input
    id="input-name"
    class="form-control"
    @type="text"
    @value={{this.name}}
    disabled={{this.isReadOnly}}
    maxlength="50"
    placeholder="Enter your name"
  />
</div>
```

```javascript
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ExampleComponent extends Component {
  @tracked name = '';
  @tracked isReadOnly = false;
}
```

```handlebars
<div class="form-check mb-3">
  <Input
    id="admin-checkbox"
    class="form-check-input"
    @type="checkbox"
    @checked={{this.isAdmin}}
    {{on "input" this.validateRole}}
  />
  <label for="admin-checkbox" class="form-check-label">Is Admin?</label>
</div>
```

```handlebars
<div class="mb-3">
  <label for="user-comment" class="form-label">Comment:</label>
  <Textarea
    id="user-comment"
    class="form-control"
    @value={{this.userComment}}
    rows="6"
  />
</div>
```

**Key rules for `<Input>` and `<Textarea>`:**
- `@value`, `@type`, and `@checked` must be passed as **arguments** (with `@`).
- Use the `{{on}}` modifier for event handling (e.g. `{{on "input" this.handler}}`).
- Bootstrap styles `form-control` correctly when `disabled` is present

#### ember-power-select example

`ember-power-select` is the recommended way to implement searchable, single, and multi-select dropdowns in ember-tribe. It is pre-installed and works alongside Bootstrap 5.x. Use it wherever a native `<select>` would be insufficient — e.g. when you need search/filter, async options, or multi-select.

**Single select (Bootstrap-compatible wrapper):**

```handlebars
<div class="mb-3">
  <label class="form-label">Assign Category:</label>
  <div class="form-control p-0 border-0">
    <PowerSelect
      @options={{this.categories}}
      @selected={{this.selectedCategory}}
      @onChange={{this.handleCategoryChange}}
      @placeholder="Select a category"
      as |category|
    >
      {{category.name}}
    </PowerSelect>
  </div>
</div>
```

```javascript
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ExampleComponent extends Component {
  @tracked selectedCategory = null;

  categories = [
    { id: 1, name: 'Design' },
    { id: 2, name: 'Engineering' },
    { id: 3, name: 'Marketing' },
  ];

  @action
  handleCategoryChange(category) {
    this.selectedCategory = category;
  }
}
```

**Multi-select variant:**

```handlebars
<div class="mb-3">
  <label class="form-label">Assign Tags:</label>
  <div class="form-control p-0 border-0">
    <PowerSelectMultiple
      @options={{this.availableTags}}
      @selected={{this.selectedTags}}
      @onChange={{this.handleTagsChange}}
      @placeholder="Select tags"
      as |tag|
    >
      {{tag.label}}
    </PowerSelectMultiple>
  </div>
</div>
```

**Async options loaded from the store:**

```handlebars
<div class="mb-3">
  <label class="form-label">Select Project:</label>
  <div class="form-control p-0 border-0">
    <PowerSelect
      @options={{this.projects}}
      @selected={{this.selectedProject}}
      @onChange={{this.handleProjectChange}}
      @searchField="name"
      @placeholder="Search projects..."
      as |project|
    >
      {{project.modules.name}}
    </PowerSelect>
  </div>
</div>
```

**Key rules for `<PowerSelect>`:**
- `@options`, `@selected`, and `@onChange` are always required arguments.
- Use `@searchField` to specify which object property drives the built-in search filter.
- For multi-select, use `<PowerSelectMultiple>` — the `@onChange` callback receives the full updated array, so assign it directly to your tracked property.

---

### Deploying to Junction (Self-Hosted)

After building your Ember app, run `php-dist` to prepare the `dist/` folder for PHP middleware:

```bash
ember build -prod
node php-dist
```

This reads `dist/index.html`, injects PHP includes (`_init.php`, `_head.php`, `_head_footer.php`, `_body_footer.php`), strips `<title>` and `<meta name="description">`, and writes `dist/index.php`.

You can then upload the `dist/` folder to [Junction (open source)](http://localhost:12002) and view your app at **http://localhost:12004**.

---

# License

This project is licensed under the [GNU GPL v3 License](LICENSE.md).
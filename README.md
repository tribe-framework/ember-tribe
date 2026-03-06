# ember-tribe

An addon that connects EmberJS to Tribe API, bridging the gap between backend data structures and frontend application development. It helps you make an Ember app based on Junction's Blueprint file, also called `types.json`.

Tribe is a collaborative project management framework - https://github.com/tribe-framework/tribe

## Compatibility

- Ember CLI v6.x (<= v6.4)

## Installation and Setup

### Prerequisites

- Ember CLI v6.x (<= v6.4)
- Node.js (latest LTS)
- Junction (optional) - via https://junction.express (cloud version) or https://tribe-framework.org (open source version)

### Installation

```bash
ember install ember-tribe
```

- Enter `TRIBE_API_URL` and `TRIBE_API_KEY` in `.env` file (copy of `.env.sample`)

---

The addon automatically configures following essential packages:

**Ember Addons:**: `ember-cli-dotenv`, `ember-cli-sass`, `ember-modifier`, `ember-composable-helpers`, `ember-truth-helpers`, `ember-file-upload` , `ember-power-select`

**NPM Packages:**:  `bootstrap`, `@popperjs/core`, `animate.css`, `video.js`, `swiper`,  `howler`

---

## Core File Structure

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

## Storylang CLI

ember-tribe ships with a command-line tool called `storylang` that synchronises the `config/storylang.json` specification with the actual Ember project files.

### Usage

```bash
storylang <command> [options]
```

**Example:**

```bash
cd /path/to/ember/app

storylang pull
# => config/storylang.json updated from project files

storylang push
# => missing routes, components, services, helpers, modifiers, and controllers are generated

storylang push -o
# => all artefacts in storylang.json are (re)generated, overwriting existing files
```

### Typical Workflow

1. Use AI to generate the ember-tribe codebase.
2. Run `storylang pull` periodically to keep the spec in sync as the project evolves.

---

# Storylang.json Documentation

## Overview

Storylang.json is a structured configuration file used in the ember-tribe ecosystem to define the frontend implementation of your application. It is found at `config/storylang.json`. It works in conjunction with your `types.json` (which defines your data types) to create a complete frontend specification.

## Purpose

The storylang.json file serves as a blueprint for frontend developers to understand:

- What routes, components, services, helpers, modifiers and types are required
- How data flows through the application

## File Structure

The storylang.json file contains seven main sections:

```json
{
  "implementation_approach": "...",
  "types": [...],
  "components": [...],
  "routes": [...],
  "services": [...],
  "helpers": [...],
  "modifiers": [...]
}
```

## Section Definitions

### 1. Implementation Approach

**Purpose**: Provides a high-level technical overview of how the frontend interface would work.

**Format**:

```json
{
  "implementation_approach": "Two-paragraph description explaining technical approach and key functionality."
}
```

---

### 2. Types

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

### 3. Components

**Purpose**: Defines reusable UI components that will be built for the application.

**Format**:

```json
{
  "components": [
    {
      "name": "component-name",
      "type": "component-type", //from the built-in components list
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

**Built-in Component Types**:

- **Layout**: `table`, `figure`, `accordion`, `card`, `list-group`, `navbar`, `nav`, `tab`, `breadcrumb`
- **Interactive**: `button`, `button-group`, `dropdown`, `modal`, `collapse`, `offcanvas`, `pagination`, `popover`, `tooltip`, `swiper-carousel`, `videojs-player`, `howlerjs-player`, `input-field`, `input-group`, `textarea`, `checkbox`, `radio`, `range`, `select`, `multi-select`, `date`, `file-uploader`, `alert`, `badge`, `toast`, `placeholder`, `progress`, `spinner`, `scrollspy`

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

### 4. Routes

**Purpose**: Defines the application's routes and their requirements.

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

### 5. Services

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

**Built-in Services**:

- `store`: Ember Data store for CRUD operations
- `router`: Ember router service for navigation
- `types`: Automatic model generation from backend tracks
- `bootstrap`: Bootstrap CSS framework with Popper.js
- `papaparse`: CSV parsing library
- `sortablejs`: Drag-and-drop sorting
- `swiperjs`: Touch slider/carousel
- `videojs`: Video player
- `howlerjs`: Audio player

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

### 6. Helpers

**Purpose**: Defines custom template helpers — pure functions used in templates to format, compute or transform data for display.

**Format**:

```json
{
  "helpers": [
    {
      "name": "helper-name",
      "description": "What this helper does",
      "args": [{ "<argumentName>": "<dataType>" }],
      "return": "<dataType>"
    }
  ]
}
```

**Helper Properties**:

- `name`: Kebab-case name of the helper
- `description`: Brief description of what the helper computes or transforms
- `args`: Input arguments the helper accepts
- `return`: The data type the helper outputs

**Example**:

```json
{
  "helpers": [
    {
      "name": "format-date",
      "description": "Formats a raw ISO date string into a human-readable date",
      "args": [{ "isoString": "string" }, { "format": "string" }],
      "return": "string"
    },
    {
      "name": "truncate-text",
      "description": "Truncates a string to a given character limit and appends an ellipsis",
      "args": [{ "text": "string" }, { "limit": "int" }],
      "return": "string"
    }
  ]
}
```

---

### 7. Modifiers

**Purpose**: Defines custom Ember modifiers — functions that directly interact with DOM elements to attach behaviour, third-party libraries or event listeners.

**Format**:

```json
{
  "modifiers": [
    {
      "name": "modifier-name",
      "description": "What DOM behaviour this modifier applies",
      "args": [{ "<argumentName>": "<dataType>" }],
      "services": ["service1"]
    }
  ]
}
```

**Modifier Properties**:

- `name`: Kebab-case name of the modifier
- `description`: Brief description of the DOM behaviour it attaches
- `args`: Arguments passed into the modifier from the template
- `services`: Ember services injected if needed

**Example**:

```json
{
  "modifiers": [
    {
      "name": "tooltip",
      "description": "Initialises a Bootstrap tooltip on the target element using the provided label",
      "args": [{ "label": "string" }, { "placement": "string" }],
      "services": []
    },
    {
      "name": "autofocus",
      "description": "Sets focus on the target element when it is inserted into the DOM",
      "args": [],
      "services": []
    }
  ]
}
```

---

## Data Types Reference

### Data Types  (dataType)

- `string`: Text values
- `int`: Integer numbers
- `bool`: Boolean true/false
- `array`: List of items
- `object`: Complex data structure

### Argument Types (argType)

- `var`: Passed data/state
- `fn`: Callback function
- `get`: Get function
- `action`: User interaction handler

---

## Integration with Other Files

### With types.json

- Type names used in routes should match type names from `types.json`
- The `types` section in storylang.json is the explicit bridge between your data types and your UI — always keep it in sync with `types.json`
- Types are the gateway to persistent storage on the backend

---

## Storylang Best Practices

**Always begin your thought process with routes → then move repeatable template logic into components → then move repeatable app-wide logic from components and routes to services → then extract reusable template and component functions into helpers → then extract template and component DOM behaviour into modifiers**

1. **Start with Routes**: Match route names to user mental models and use consistent naming conventions
2. **Minimize Route Logic**: Preferably fetch (read) type data in routes and then pass that data to components or services. Other than fetching type data, minimize the use of javascript in routes — Javascript is meant to be in components and services more than in routes
3. **Route Parameters**: Keep get_vars minimal and meaningful, and load only necessary types for each route
4. **Component Focus**: Keep components focused on single responsibilities and use descriptive, kebab-case names
5. **Data Flow**: Receive backend data down from routes (via inherited_args) rather than fetching (reading) in components
6. **Component Actions**: Non-read functions — create, update, delete — can all happen well at component-level
7. **Service Integration**: Use services directly in both components and routes for app-wide logic
8. **Service Architecture**: Keep services stateless when possible and use dependency injection for service composition
9. **Service Role**: Services interact with both routes and components and store the core logic of the application
10. **Helpers**: Keep helpers pure and stateless — they should only receive input and return output with no side effects
11. **Modifiers**: Use modifiers to isolate all direct DOM manipulation and third-party library initialisation from component logic
12. **Types Mapping**: Populate the `types` section as you define your routes and components — it is your traceability layer between data types and UI

---

# Ember-Tribe Development Guide

## Required File Outputs

Make separate, complete code files for each category:

### Example installer.sh

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

### Default styling

Following is the default style that comes with tribe. Use the app.scss file for all style code. Change this based on your design styling requirements.

```app/styles/app.scss
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&display=swap');

$font-family-sans-serif: 'IBM Plex Mono', serif !default;
$display-font-family: 'IBM Plex Mono', serif !default;

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

### Defauly application structure

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

## EmberData Integration

ember-tribe automatically generates models from backend track definitions through the `types` service:

### Data Access Patterns

EmberData operations always use a "modules" key for field access, except for `.id` and `.slug` properties. All field names from backend storage use underscore notation: `modules.any_field`.

```javascript
// Accessing track data
let post = await this.store.findRecord('post', 1);
console.log(post.id); // Direct property
console.log(post.slug); // Direct property
console.log(post.modules.title); // Field access
console.log(post.modules.content_privacy); // Universal field
```

### Query Operations

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
    modules: { name: 'Peter', location: 'delhi' }, //results with AND
    /*
    filter: { name: 'Peter', location: 'delhi' } //results with OR
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

## Component Architecture

### Component Structure

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

### Template Patterns

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

## Services Integration

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

## Route Generation

### Route Creation

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

## Helper System

### Global Helpers

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

### Template Usage

```handlebars
<span class='text-muted'>
	{{format-date @post.modules.created_date 'medium'}}
</span>
```

---

## Modifier System

### DOM Interaction Modifiers

Make modifiers for specific DOM manipulation needs:

```javascript
// app/modifiers/tooltip.js
import { modifier } from 'ember-modifier';
import { Tooltip } from 'bootstrap';

export default modifier((element, [content]) => {
	const tooltip = new bootstrap.Tooltip(element, {
		title: content,
	});

	return () => tooltip.dispose();
});
```

## Helpers

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

### Component Architecture & Principle of Substitution

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

### Component Communication & Modifiers

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

### Services

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

## Code Generation Process

### File Upload Javascript Example

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

---

## Best Practices

1. **Module Access**: Remember to use `modules.field_name` for backend fields
2. **npm packages vs ember addons**: Prioritize npm packages over ember addons for better compatibility, when both are offering similar functionality
3. **Minimal Controllers**: Logic should ideally reside in components and services
4. **Bootstrap 5.x Foundation**: Responsive, accessible design system
5. **Use FontAwesome 6.x**: Comprehensive icon library
6. **Animations**: If required, use animate.css for enhanced user experience. Prefer subtle animations (fadeIn, slideIn). Avoid overwhelming users with excessive animation
7. **Access Cache**: Leverage EmberData caching with `peekRecord`
8. **Avoid array manipulations of backend data**: Use backend filtering over frontend array manipulation

---

# License

This project is licensed under the [GNU GPL v3 License](LICENSE.md).
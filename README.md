# ember-tribe

An addon that connects EmberJS to Tribe API.
Tribe is a collaborative project management framework - https://github.com/tribe-framework/tribe

https://junction.express provides an interface to build a Tribe compatible no-code backend in minutes.

## Compatibility

- Ember.js v6.0 or above
- Ember CLI v6.0 or above

## Installation

1. Install

```
ember install ember-tribe
```

2. Configure

- Enter TRIBE_API_URL and TRIBE_API_KEY in .env file, copy of .env.sample

---

# Ember-Tribe Documentation

## Overview

ember-tribe is a powerful Ember.js addon that bridges the gap between backend CMS data structures and frontend application development. It helps you make an Ember app based on `storylang.json` and `simplified-types.json` files, if and when these files are available.

## Purpose

Ember-tribe enables rapid application development by:

- Providing pre-configured addon ecosystem for common functionality
- Implementing standardized patterns for Tribe applications
- Creating responsive, Bootstrap-based interfaces with minimal configuration
- Supporting automatic model generation from backend track definitions in simplified-types.json

## Installation and Setup

### Prerequisites

- Ember.js 6.x
- Node.js (latest LTS)
- Junction backend

### Installation

```bash
ember install ember-tribe
```

The addon automatically configures following essential packages:

**Ember Addons:**

- `ember-cli-dotenv` - Environment configuration
- `ember-cli-sass` - SCSS support
- `ember-modifier` - DOM manipulation helpers
- `ember-composable-helpers` - Template utilities
- `ember-truth-helpers` - Boolean logic helpers
- `ember-file-upload` - File handling
- `ember-power-select` - Advanced select components
- `ember-table` - Data tables
- `ember-animated` - Smooth animations

**NPM Packages:**

- `bootstrap` - UI framework
- `@popperjs/core` - Bootstrap dependency
- `animate.css` - CSS animations
- `video.js` - Video player
- `swiper` - Touch sliders
- `howler` - Audio management

---

## Core Architecture

### Think in this order

ember-tribe follows a specific order that includes our learnings and Ember.js best practices, and must be followed exactly:

1. **router.js** - Application routing structure
2. **app/routes** - Route handlers and data loading
3. **app/templates & controllers** - UI templates and minimal controllers
4. **app/components** - Reusable UI components with component specific logic
5. **app/services** - Application-wide logic and state

This order ensures proper dependency resolution and optimal code organization.

### Package Philosophy

**Try using npm packages over ember addons because ember addons are sometimes outdated.** Ember-tribe prioritizes npm packages for better compatibility and maintenance.

### File Structure

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

ember-tribe ships with a command-line tool called `storylang` that synchronises the `config/storylang.json` specification with the actual Ember project files. It is installed automatically when you run `ember install ember-tribe`.

### Usage

```bash
storylang <command> [options]
```

### Commands

#### `storylang pull`

Reads the current Ember project and generates (or updates) `config/storylang.json` to reflect what already exists on disk.

The command scans the following directories and maps every discovered artefact into the corresponding section of the storylang spec:

| Ember directory      | Storylang section |
| -------------------- | ----------------- |
| `app/routes/`        | `routes`          |
| `app/controllers/`   | `routes` (merged) |
| `app/components/`    | `components`      |
| `app/services/`      | `services`        |
| `app/helpers/`       | `helpers`         |
| `app/modifiers/`     | `modifiers`       |
| `app/models/`        | `types`           |

For each artefact discovered the command parses the source file and extracts:

- **Routes** — `tracked_vars`, `get_vars` (query params), injected `services`, referenced `components`, `helpers`, `modifiers`, loaded `types`, and `actions`.
- **Controllers** — query-param definitions and actions are merged into the matching route entry.
- **Components** — `tracked_vars`, `inherited_args` (from template `@arg` usage), `actions`, injected `services`, referenced `helpers` and `modifiers`, and the component `type` (inferred from template markup when possible).
- **Services** — `tracked_vars`, `actions`, injected `services`, and referenced `helpers`.
- **Helpers** — `name`, `description` (from JSDoc if present), `args`, and `returns` type.
- **Modifiers** — `name`, `description`, `args`, and injected `services`.
- **Models / Types** — model names are listed in the `types` section with their `used_in` map populated from cross-references found in routes, components, and services.

The `implementation_approach` field is left unchanged if it already exists, or set to an empty string for manual completion.

**Example:**

```bash
cd my-ember-app
storylang pull
# => config/storylang.json updated from project files
```

#### `storylang push`

Reads `config/storylang.json` and generates any Ember artefacts that do not yet exist in the project. It effectively turns the storylang spec into real files via `ember generate`.

The mapping works as follows:

| Storylang section | Ember generate command                |
| ----------------- | ------------------------------------- |
| `routes`          | `ember g route <name>`                |
| `routes`          | `ember g controller <name>`           |
| `components`      | `ember g component <name> -gc`        |
| `services`        | `ember g service <name>`              |
| `helpers`         | `ember g helper <name>`               |
| `modifiers`       | `ember g modifier <name>`             |
| `types`           | *(models are auto-generated at runtime by the `types` service — no file generation needed; their presence in storylang.json is sufficient)* |

By default, `storylang push` **will not overwrite** files that already exist on disk. Only artefacts missing from the project are created.

**Overwrite flag:**

```bash
storylang push -o
```

When `-o` (or `--overwrite`) is set, existing files will be regenerated. Use with caution — this will replace any manual edits in the affected files.

**Example:**

```bash
cd my-ember-app
storylang push
# => only missing routes, components, services, helpers, modifiers, and controllers are generated

storylang push -o
# => all artefacts in storylang.json are (re)generated, overwriting existing files
```

### Typical Workflow

1. Design your frontend specification in `config/storylang.json` (or generate it from an existing project with `storylang pull`).
2. Run `storylang push` to scaffold all the required files.
3. Implement the application logic inside the generated files.
4. Run `storylang pull` periodically to keep the spec in sync as the project evolves.

---

# What is Storylang?

Storylang is a language that can be used for storyboarding user experiences. It brings precision and clarity to the collaborative process for people involved in UX design and frontend development.

Storylang is JSON-compatible.

Long-term goal: Storylang must evolve into a written script notation framework that can help imagine, annotate and communicate.

Inspiration to create this was drawn from music notations.

![Storylang notations](https://wildfiretech.co/theme/assets/img/bach-notes.png)<br>
<em>Above: Hand-written musical notation by J. S. Bach (1685–1750).</em>

---

# Storylang.json Documentation

## Overview

Storylang.json is a structured configuration file used in the ember-tribe ecosystem to define the frontend implementation of your application. It lives inside the Ember project's `config/` folder at `config/storylang.json`. It works in conjunction with your `simplified-types.json` (which defines your data types) to create a complete frontend specification.

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

**Purpose**: Declares which data types from `simplified-types.json` are used in this application, and maps them to the components, routes, services, helpers and modifiers that consume them. This creates a traceable link between your data layer and your UI implementation.

**Format**:

```json
{
  "types": [
    {
      "name": "type-name",
      "used_in": {
        "components": ["component-name"],
        "routes": ["route-name"],
        "services": ["service-name"]
      }
    }
  ]
}
```

**Type Properties**:

- `name`: The type name as defined in `simplified-types.json`
- `used_in`: An object mapping the type to the parts of the app that reference it
  - `components`: Components that receive or manipulate this type
  - `routes`: Routes that load or use this type
  - `services`: Services that operate on this type

**Example**:

```json
{
  "types": [
    {
      "name": "json_file",
      "used_in": {
        "components": ["file-summary-card", "file-list"],
        "routes": ["files", "files.show"],
        "services": ["file-manager"]
      }
    },
    {
      "name": "user",
      "used_in": {
        "components": ["profile-card"],
        "routes": ["profile"],
        "services": ["session"]
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
      "type": "component-type",
      "tracked_vars": [{ "variable_name": "data_type" }],
      "inherited_args": [{ "arg_name": "type" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1", "helper2"],
      "modifiers": ["modifier1"],
      "services": ["service1", "service2"]
    }
  ]
}
```

**Component Properties**:

- `name`: Kebab-case name of the component
- `type`: Type from the built-in components list
- `tracked_vars`: State variables tracked within the component
- `inherited_args`: Arguments passed from parent components
- `actions`: User interactions the component handles
- `helpers`: Template helpers used within the component
- `modifiers`: DOM modifiers applied to elements
- `services`: Ember services injected into the component

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
        { "onEdit": "fn" },
        { "onDelete": "fn" }
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
      "name": "route-name",
      "tracked_vars": [{ "variable_name": "data_type" }],
      "get_vars": [{ "param_name": "data_type" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1"],
      "services": ["service1"],
      "components": ["component1", "component2"],
      "types": ["type1", "type2"]
    }
  ]
}
```

**Route Properties**:

- `name`: The route name (matches Ember router)
- `tracked_vars`: Route-level state variables
- `get_vars`: URL query parameters and their types
- `actions`: Route-level actions
- `helpers`: Template helpers used in route templates
- `services`: Services used by the route
- `components`: Components rendered in this route
- `types`: Data types loaded by this route

**Example**:

```json
{
  "routes": [
    {
      "name": "files",
      "tracked_vars": [
        { "selectedFileType": "string" },
        { "sortOrder": "string" }
      ],
      "get_vars": [
        { "page": "int" },
        { "search": "string" },
        { "filter": "string" }
      ],
      "actions": ["filterFiles", "sortFiles", "searchFiles"],
      "helpers": ["pluralize", "formatDate"],
      "services": ["store", "router"],
      "components": ["file-list", "file-filter", "search-box", "pagination"],
      "types": ["json_file"]
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
      "tracked_vars": [{ "variable_name": "data_type" }],
      "actions": ["action1", "action2"],
      "helpers": ["helper1"],
      "services": ["dependency1", "dependency2"]
    }
  ]
}
```

**Service Properties**:

- `name`: Service name
- `tracked_vars`: Service-level tracked properties
- `actions`: Methods provided by the service
- `helpers`: Utility functions
- `services`: Other services this service depends on

**Built-in Services**:

- `store`: Ember Data store for CRUD operations
- `router`: Ember router service for navigation
- `types`: Automatic model generation from backend tracks
- `bootstrap`: Bootstrap component initialization

**Third-party npm packages pre-installed**:

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
      "args": [{ "arg_name": "data_type" }],
      "returns": "data_type"
    }
  ]
}
```

**Helper Properties**:

- `name`: Kebab-case name of the helper
- `description`: Brief description of what the helper computes or transforms
- `args`: Input arguments the helper accepts
- `returns`: The data type the helper outputs

**Example**:

```json
{
  "helpers": [
    {
      "name": "format-date",
      "description": "Formats a raw ISO date string into a human-readable date",
      "args": [{ "isoString": "string" }, { "format": "string" }],
      "returns": "string"
    },
    {
      "name": "truncate-text",
      "description": "Truncates a string to a given character limit and appends an ellipsis",
      "args": [{ "text": "string" }, { "limit": "int" }],
      "returns": "string"
    },
    {
      "name": "pluralize",
      "description": "Returns singular or plural form of a word based on a count",
      "args": [{ "count": "int" }, { "word": "string" }],
      "returns": "string"
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
      "args": [{ "arg_name": "data_type" }],
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
      "name": "sortable-list",
      "description": "Attaches SortableJS drag-and-drop behaviour to a list element",
      "args": [{ "items": "array" }, { "onReorder": "fn" }],
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

### Common Data Types

- `string`: Text values
- `int`: Integer numbers
- `bool`: Boolean true/false
- `array`: List of items
- `object`: Complex data structure
- `var`: Variable (any type)
- `fn`: Function reference

### Argument Types

- `var`: Passed data/state
- `fn`: Callback function
- `action`: User interaction handler

---

## Integration with Other Files

### With simplified-types.json

- Type names used in routes should match type names from `simplified-types.json`
- The `types` section in storylang.json is the explicit bridge between your data types and your UI — always keep it in sync with `simplified-types.json`
- Component `inherited_args` often reference type data pulled from store, and/or their fields
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

## Tips for Manual Creation of storylang.json

1. **Start with implementation_approach**: Write a clear use case first
2. **Declare types early**: List the types from `simplified-types.json` you'll need before designing routes and components
3. **Identify key user journeys**: Map these to routes
4. **Break down UI into components**: Focus on reusability
5. **Define data flow**: Ensure types align with your `simplified-types.json`
6. **Plan service architecture**: Keep core application logic separate from UI logic
7. **Extract helpers**: Any formatting or computation repeated across templates should become a named helper
8. **Extract modifiers**: Any direct DOM interaction or third-party library setup should become a named modifier

---

# Ember-Tribe Development Guide

## Required File Outputs

Make separate, complete code files for each category:

### installer.sh

```bash
ember g route <n>;
ember g controller <n>;
ember g component <n> -gc;
ember g helper <n>;
ember g modifier <n>;
ember g service <n>;
```

### app/styles/app.scss

```scss
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

### app/templates/application.hbs

```handlebars
{{page-title 'Your Application Name'}}
{{outlet}}
<BasicDropdownWormhole />
```

**Application.hbs Extension Guidelines:**

- Extend when adding global navigation components
- Include shared modals or dropdowns
- Add application-wide notification systems
- Insert global loading states or overlays

---

## EmberData Integration

### Automatic Model Generation

Ember-tribe automatically generates models from backend track definitions through the `types` service:

```javascript
// app/routes/application.js
export default class ApplicationRoute extends Route {
	@service types;

	async beforeModel() {
		// Auto-generates models from backend
		await this.types.fetchAgain();
	}
}
```

### Data Access Patterns

All backend data uses the `modules` key for field access:

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

---

## Styling System

### Default Configuration (app.scss)

```scss
// Typography
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono...');
$font-family-sans-serif: 'IBM Plex Mono', serif !default;

// Color Palette
$primary: #000000 !default;
$secondary: #cccccc !default;
$success: #00ff00 !default;
// ... additional colors

// Bootstrap Configuration
$enable-rounded: false !default;
$enable-negative-margins: true !default;
$enable-cssgrid: true !default;

@import 'node_modules/bootstrap/scss/bootstrap';
@import 'node_modules/animate.css/animate';
```

### Design Principles

- **Minimal Controllers**: Logic should reside in components and services
- **Bootstrap 5.x Foundation**: Responsive, accessible design system
- **Subtle Animations**: animate.css for enhanced user experience
- **FontAwesome 6.x**: Comprehensive icon library

---

## Component Architecture

### Component Types

Based on storylang.json component definitions:

**Layout Components:**

- `table`, `figure`, `accordion`, `card`, `list-group`
- `navbar`, `nav`, `tab`, `breadcrumb`

**Interactive Components:**

- `button`, `button-group`, `dropdown`, `modal`
- `input-field`, `select`, `file-uploader`
- `pagination`, `popover`, `tooltip`

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

### Built-in Services

- `store` - EmberData for CRUD operations
- `router` - Navigation and route management
- `types` - Automatic model generation
- `bootstrap` - Bootstrap component initialization

### Custom Services

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

	model(params) {
		return this.store.query('json_file', {
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

---

## Ember.js Reference Guide

### EmberData Patterns

Smart use of EmberData can significantly reduce size of the codebase. Make sure you take advantage of that.

EmberData operations always use a "modules" key for field access, except for `.id` and `.slug` properties. All field names from backend storage use underscore notation: `modules.any_field`.

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

### Helpers

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

	add(item) {
		this.items.push(item);
	}

	remove(item) {
		this.items.splice(this.items.indexOf(item), 1);
	}

	empty() {
		this.items.splice(0, this.items.length);
	}
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

**Usage Guidelines:**

- Use for application-wide state management
- Share functionality across multiple routes/components
- Maintain data that survives route transitions

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

### Installation Commands

```bash
# Write all installer.sh commands
ember g route files
ember g controller files
ember g component file-card -gc
ember g helper format-date
ember g modifier tooltip
ember g service visualization-builder
```

### Pre-approval Process

Before code generation, ember-tribe requests approval for additional packages:

```bash
# Example approval request
npm i chart.js
npm i lodash
ember install ember-table
```

---

## Application Structure

### Application Template

```handlebars
{{page-title 'Your Application Name'}}
{{outlet}}
<BasicDropdownWormhole />
```

---

## Best Practices

### Controller Minimization

- Keep controllers minimal - prefer component logic
- Use controllers only for query params and route-level actions
- Move business logic to services

### Animation Guidelines

- Use animate.css for enhanced UX
- Prefer subtle animations (fadeIn, slideIn)
- Avoid overwhelming users with excessive animation

### Data Flow

1. **Routes**: Fetch and prepare data
2. **Components**: Display and interact with data
3. **Services**: Handle business logic and state
4. **Helpers**: Transform data for display

### Performance Considerations

- Leverage EmberData caching with `peekRecord`
- Use backend filtering over frontend array manipulation
- Implement pagination for large datasets
- Minimize controller file count

---

## Integration Examples

### With Junction CMS

```javascript
// Automatic sync with Junction tracks
async beforeModel() {
  await this.types.fetchAgain(); // Syncs with backend types
}
```

### With External APIs

```javascript
// Service for external integrations
@service externalApi;

async model() {
  const localData = await this.store.query('post', {});
  const externalData = await this.externalApi.fetch('/posts');
  return { local: localData, external: externalData };
}
```

---

## Troubleshooting

### Common Issues

1. **Model Not Found**: Ensure `types.fetchAgain()` completes in application route
2. **Module Access**: Remember to use `modules.field_name` for backend fields
3. **Bootstrap Components**: Initialize through modifier or service
4. **Animation Conflicts**: Check animate.css class conflicts

### Debug Commands

```javascript
// Check loaded models
this.store.peekAll('your-model-name');

// Verify service registration
this.owner.lookup('service:your-service');

// Route debugging
console.log(this.router.currentRouteName);
```

---

# License

This project is licensed under the [GNU GPL v3 License](LICENSE.md).
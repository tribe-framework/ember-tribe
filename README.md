# ember-tribe

An addon that connects EmberJS to Tribe API.
Tribe is a collaborative project management framework - https://github.com/tribe-framework/tribe

https://junction.express provides an interface to build a Tribe compatibale no-code backend in minutes.

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

# Ember-Tribe Documentation

## Overview

Ember-tribe is a powerful Ember.js addon that bridges the gap between backend CMS data structures and frontend application development. It helps you make an Ember app from storylang.json, navigator.json and simplified-types.json files.

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
installer.sh
```

## Required File Outputs

Ember-tribe generates separate, complete code files for each category:

### installer.sh

```bash
ember g route <name>;
ember g controller <name>;
ember g component <name> -gc;
ember g helper <name>;
ember g modifier <name>;
ember g service <name>;
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
// Generated component class
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

## Services Integration

### Built-in Services

- `store` - EmberData for CRUD operations
- `router` - Navigation and route management
- `types` - Automatic model generation
- `bootstrap` - Bootstrap component initialization

### Custom Services

Generated based on storylang.json service definitions:

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

## Route Generation

### Automatic Route Creation

Routes are generated based on storylang.json route definitions:

```javascript
// Generated route
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

## Helper System

### Global Helpers

Auto-generated based on storylang.json helper requirements:

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

## Modifier System

### DOM Interaction Modifiers

Generated for specific DOM manipulation needs:

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
# Generated installer.sh commands
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

## Application Structure

### Application Template

```handlebars
{{page-title 'Your Application Name'}}
{{outlet}}
<BasicDropdownWormhole />
```

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

# License

This project is licensed under the [GNU GPL v3 License](LICENSE.md).

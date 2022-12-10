'use strict';

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addAddonsToProject({
      packages: [
      { name: 'ember-cli-sass' }, 
      { name: 'ember-cli-favicon' }, 
      { name: '@ember/optional-features' }, 
      { name: '@ember/render-modifiers' }, 
      { name: 'ember-modifier' }, 
      { name: 'ember-prop-modifier' }, 
      { name: 'ember-composable-helpers' }, 
      { name: 'ember-truth-helpers' }, 
      { name: 'ember-math-helpers' }, 
      { name: 'ember-cli-string-helpers' }, 
      { name: 'ember-animated' }, ],
    }).then(() => {
      return this.addPackagesToProject([
        { name: 'bootstrap' },
        { name: '@fortawesome/fontawesome-pro' },
      ]);
    });
  },
};
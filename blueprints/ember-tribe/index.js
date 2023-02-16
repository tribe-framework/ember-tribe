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
      { name: 'ember-promise-helpers' }, 
      { name: 'ember-tag-input' }, 
      { name: 'ember-flatpickr' }, 
      { name: 'ember-file-upload' }, 
      { name: 'ember-toggle' }, 
      { name: 'ember-content-editable' },
      { name: '@fortawesome/ember-fontawesome' }, 
      { name: 'ember-animated' }, ],
    }).then(() => {
      return this.addPackagesToProject([
        { name: 'bootstrap' },
        { name: 'animate.css' },
        { name: 'video.js' },
        { name: 'swiper' },
        { name: '@fortawesome/pro-solid-svg-icons' },
        { name: '@fortawesome/pro-regular-svg-icons' },
        { name: '@fortawesome/pro-light-svg-icons' },
        { name: '@fortawesome/pro-duotone-svg-icons' },
        { name: '@fortawesome/pro-thin-svg-icons' },
        { name: '@fortawesome/free-brands-svg-icons' },
      ]);
    });
  },
};
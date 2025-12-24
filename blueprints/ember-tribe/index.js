'use strict';

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-cli-dotenv' },
        { name: 'ember-cli-sass' },
        { name: 'ember-cli-favicon' },
        { name: '@ember/optional-features' },
        { name: 'ember-modifier' },
        { name: 'ember-composable-helpers' },
        { name: 'ember-truth-helpers' },
        { name: 'ember-svg-jar' },
        { name: 'ember-math-helpers' },
        { name: 'ember-cli-string-helpers' },
        { name: 'ember-promise-helpers' },
        { name: '@ember/test-waiters' },
        { name: 'ember-tag-input' },
        { name: 'ember-file-upload' },
        { name: 'ember-toggle' },
        { name: 'ember-concurrency' },
        { name: 'ember-click-outside' },
        { name: 'ember-web-app' },
        { name: 'tracked-built-ins' },
        { name: 'ember-keyboard' },
        { name: 'ember-router-scroll' },
        { name: 'ember-table' },
        { name: 'ember-animated' },
        { name: 'ember-power-select' },
      ],
    }).then(() => {
      return this.addPackagesToProject([
        { name: 'bootstrap' },
        { name: '@popperjs/core' },
        { name: 'animate.css' },
        { name: 'video.js' },
        { name: 'swiper' },
        { name: 'howler' },
        { name: 'ripplet.js' },
        { name: '@ember/string' },
        { name: '@editorjs/editorjs' },
        { name: '@editorjs/image' },
        { name: '@editorjs/header' },
        { name: '@editorjs/raw' },
        { name: '@editorjs/code' },
        { name: '@editorjs/marker' },
        { name: '@editorjs/delimiter' },
        { name: '@editorjs/quote' },
        { name: '@editorjs/list' },
        { name: '@editorjs/attaches' },
        { name: '@editorjs/footnotes' },
        { name: '@editorjs/table' },
        { name: 'editorjs-hyperlink' },
        { name: 'miragejs' },
        { name: 'papaparse' },
        { name: 'sortablejs' },
        { name: 'highlight.js' },
        { name: 'uuid' },
        { name: 'pretty-print-json' },
      ]);
    });
  },
};

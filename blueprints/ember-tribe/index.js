'use strict';

module.exports = {
  normalizeEntityName() {},

  afterInstall() {
    return this.addPackagesToProject([
      { name: 'bootstrap' },
      { name: '@popperjs/core' },
      { name: 'sass' },
      { name: 'animate.css' },
      { name: 'video.js' },
      { name: 'swiper' },
      { name: 'howler' },
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
      { name: '@embroider/vite' },
      { name: '@embroider/compat' },
      { name: 'miragejs' },
      { name: 'papaparse' },
      { name: 'sortablejs' },
      { name: 'highlight.js' },
      { name: 'uuid' },
      { name: 'pretty-print-json' },
      { name: 'dotenv' },
      { name: '@vite-pwa/assets-generator' },
      { name: 'vite-plugin-pwa' },
    ]).then(() => {
      return this.addAddonsToProject({
        packages: [
          { name: 'ember-modifier' },
          { name: '@nullvoxpopuli/ember-composable-helpers' },
          { name: 'ember-truth-helpers' },
          { name: 'ember-math-helpers' },
          { name: 'ember-cli-string-helpers' },
          { name: 'ember-promise-helpers' },
          { name: 'ember-tag-input' },
          { name: 'ember-file-upload' },
          { name: 'ember-data' },
          { name: 'ember-basic-dropdown' },
          { name: 'ember-power-select' },
          { name: 'ember-click-outside' },
          { name: 'ember-keyboard' },
          { name: 'ember-concurrency' },
          { name: 'ember-animated' },
        ],
      });
    });
  },
};

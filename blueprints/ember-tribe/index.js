'use strict';

module.exports = {
  normalizeEntityName() {},

  taskFor(dasherizedName) {
    const Task = require(
      require.resolve(`ember-cli/lib/tasks/${dasherizedName}`, {
        paths: [this.project.root],
      }),
    );

    return new Task({
      ui: this.ui,
      project: this.project,
    });
  },

  afterInstall() {
    return this.addAddonsToProject({
      packages: [
        { name: 'ember-modifier' },
        { name: '@nullvoxpopuli/ember-composable-helpers' },
        { name: 'ember-truth-helpers' },
        { name: 'ember-svg-jar' },
        { name: 'ember-math-helpers' },
        { name: 'ember-cli-string-helpers' },
        { name: 'ember-file-upload' },
        { name: 'ember-basic-dropdown' },
        { name: 'ember-power-select' },
        { name: 'ember-click-outside' },
        { name: 'tracked-built-ins' },
        { name: 'ember-keyboard' },
        { name: 'ember-concurrency' },
        { name: 'ember-animated' },
      ],
    }).then(() => {
      return this.addPackagesToProject([
        { name: 'sass' },
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

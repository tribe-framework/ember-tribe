'use strict';

const path = require('path');

module.exports = {
  normalizeEntityName() {},

  taskFor(dasherizedName) {
    const searchPaths = [
      this.project.root,
      path.dirname(require.main.filename),
      __dirname,
    ];

    let taskPath;

    for (const searchPath of searchPaths) {
      try {
        taskPath = require.resolve(`ember-cli/lib/tasks/${dasherizedName}`, {
          paths: [searchPath],
        });
        break;
      } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') {
          throw error;
        }
      }
    }

    if (!taskPath) {
      throw new Error(
        `ember-tribe: could not resolve ember-cli task "${dasherizedName}"`,
      );
    }

    const Task = require(taskPath);

    return new Task({
      ui: this.ui,
      project: this.project,
    });
  },

  afterInstall() {
    return this.addPackagesToProject([
      { name: 'dotenv' },
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
    ]).then(() => {
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
      });
    });
  },
};
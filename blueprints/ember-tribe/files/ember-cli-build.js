'use strict';
require('dotenv').config();

const { compatBuild } = require('@embroider/compat');
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = async function (defaults) {
  const { buildOnce } = await import('@embroider/vite');

  const app = new EmberApp(defaults, {
    emberData: {
      deprecations: { DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false }
    }
  });

  return compatBuild(app, buildOnce, {
    staticInvokables: true, // this is the default so you don't need to set it
    splitAtRoutes: ['route.name'], // can also be a RegExp
  );
};

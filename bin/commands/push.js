'use strict';

const push = require('../../lib/storylang/push');

module.exports.command = 'push';

module.exports.describe = 'generate missing Ember files from config/storylang.json';

module.exports.builder = {
  overwrite: {
    alias: 'o',
    type: 'boolean',
    default: false,
    describe: 'overwrite existing files instead of skipping them',
  },
};

module.exports.handler = async function handler(argv) {
  try {
    await push(process.cwd(), { overwrite: argv.overwrite });
  } catch (err) {
    console.error(err);
  }
};

'use strict';

const pull = require('../../lib/storylang/pull');

module.exports.command = 'pull';

module.exports.describe = 'update config/storylang.json from current project files';

module.exports.handler = async function handler() {
  try {
    await pull(process.cwd());
  } catch (err) {
    console.error(err);
  }
};

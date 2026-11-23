'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function (/* environment, appConfig */) {
  const envFile = path.join(process.cwd(), '.env');
  if (fs.existsSync(envFile)) {
    process.loadEnvFile(envFile);
  }

  let ENV = {
    //Wildfire Tribe config for EmberJS
    TribeENV: {
      API_URL: process.env.TRIBE_API_URL,
      API_KEY: process.env.TRIBE_API_KEY,
    },
    PUSHER_API_KEY: process.env.PUSHER_API_KEY,
    PUSHER_CLUSTER: process.env.PUSHER_CLUSTER,
  };

  return ENV;
};

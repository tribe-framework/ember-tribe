'use strict';

module.exports = function (/* environment, appConfig */) {
  let ENV = {
    //Wildfire Tribe config for EmberJS
    TribeENV: {
      API_URL: process.env.TRIBE_API_URL,
      API_KEY: process.env.TRIBE_API_KEY,
    },
  };

  return ENV;
};

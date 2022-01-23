import JSONAPIAdapter from '@ember-data/adapter/json-api';
import config from '<%= dasherizedPackageName %>/config/environment';
import { underscore } from '@ember/string';

export default class ApplicationAdapter extends JSONAPIAdapter {
  host = config.TribeENV.API_URL;

  pathForType(type) {
    return underscore(type);
  }
}
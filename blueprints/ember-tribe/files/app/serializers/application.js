import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';
import { underscore } from '@ember/string';

export default class ApplicationSerializer extends JSONAPISerializer {
  keyForAttribute(attr) {
    return underscore(attr);
  }

  payloadKeyFromModelName(key) {
    return underscore(key);
  }
}

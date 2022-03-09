import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service store;

  model() {
    return this.store.findRecord('types_json', 0);
  }
}

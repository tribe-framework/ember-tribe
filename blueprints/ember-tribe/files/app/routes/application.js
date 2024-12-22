import Route from '@ember/routing/route';
import * as bootstrap from 'bootstrap';
import { service } from '@ember/service';

export default class ApplicationRoute extends Route {
  @service types;

  async beforeModel() {
    await this.types.fetchAgain();
  }
}

import Route from '@ember/routing/route';
import 'bootstrap';
import { service } from '@ember/service';
import { action } from '@ember/object';

export default class ApplicationRoute extends Route {
  @service types;

  async beforeModel() {
    await this.types.fetchAgain();
  }

  @action
  didTransition() {
    setTimeout(() => {
      document.querySelector('#loading').classList.add('d-none');
    }, 50);
  }

  @action
  willTransition() {
    document.querySelector('#loading').classList.remove('d-none');
  }
}

import Route from '@ember/routing/route';

export default class StorylangRoute extends Route {
  async model() {
    const response = await fetch('/storylang.json');
    const data = await response.json();
    return data;
  }
}

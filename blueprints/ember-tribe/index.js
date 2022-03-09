'use strict';

module.exports = {
  normalizeEntityName() {}, // no-op since we're just adding dependencies

  afterInstall() {
    return this.addAddonsToProject({
      packages: [{ name: 'ember-cli-sass' }, { name: 'ember-cli-favicon' }],
    }).then(() => {
      return this.addPackagesToProject([
        { name: 'bootstrap' },
        { name: 'plyr' },
        { name: 'swiper' },
      ]);
    });
  },
};
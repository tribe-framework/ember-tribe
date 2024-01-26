ember-tribe
==============================================================================

An addon that connects EmberJS to Tribe API.
Tribe is a project management framework by Postcode - https://github.com/tribe-framework/tribe


Compatibility
------------------------------------------------------------------------------

* Ember.js v5.4 or above
* Ember CLI v5.4 or above


Installation
------------------------------------------------------------------------------

1. Install
```
ember install ember-tribe
```

2. Configure
- Enter TRIBE_API_URL in .env file in Ember directory.

3. Sync Tribe's types.json with Ember Models
```
php sync-types.php
```
4. To serve front-end webapp from backend server and for using page-wise meta tags
- On local:
```
php sync-dist.php
```
- On server:
```
bash -c "$(wget --no-cache --no-cookie https://raw.githubusercontent.com/tribe-framework/tribe/master/install/ember.sh -O -)"
```

Usage
------------------------------------------------------------------------------

For more info visit https://postcodesolutions.com


Contributing
------------------------------------------------------------------------------

See the [Contributing](CONTRIBUTING.md) guide for details.


License
------------------------------------------------------------------------------

This project is licensed under the [MIT License](LICENSE.md).

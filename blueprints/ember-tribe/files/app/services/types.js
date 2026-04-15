import Service from '@ember/service';
import ENV from '<%= dasherizedPackageName %>/config/environment';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class TypesService extends Service {
  @service store;
  @tracked json = null;
  @tracked simplifiedJson = null;

  @action
  async fetchAgain() {
    if (ENV.TribeENV.API_URL !== undefined && ENV.TribeENV.API_URL != '') {
      // First fetch — get the webapp blueprint (no includes yet)
      this.json = await this.store.findRecord('webapp', 0, {});

      // Feed the blueprint into the store so it knows every type's schema
      this.store.loadBlueprint(this.json);

      // Second fetch — now with total_objects included
      this.json = await this.store.findRecord('webapp', 0, {
        include: 'total_objects',
      });

      // Re-load blueprint with the enriched response
      this.store.loadBlueprint(this.json);

      this.simplifiedJson = this.convertTypesToSimplified(this.json);
    }
  }

  convertTypesToSimplified = (typesJson) => {
    const simplifiedTypes = {
      project_description: typesJson.modules?.webapp?.project_description ?? '',
      types: {},
    };

    for (const [typeSlug, typeData] of Object.entries(typesJson.modules || {})) {
      if (
        typeSlug === 'webapp' ||
        typeSlug === 'deleted_record' ||
        typeSlug === 'platform_record' ||
        typeSlug === 'blueprint_record' ||
        typeSlug === 'file_record' ||
        typeSlug === 'apikey_record' ||
        !typeData.modules ||
        !Array.isArray(typeData.modules)
      ) {
        continue;
      }

      simplifiedTypes.types[typeSlug] = {};

      typeData.modules.forEach((module) => {
        const slug = module.input_slug;
        let varType =
          (module.var_type ?? 'string') +
          (module.linked_type ? ' | *' + module.linked_type : '');

        if (
          module.input_options &&
          Array.isArray(module.input_options) &&
          module.input_options.length > 0
        ) {
          const optionSlugs = module.input_options.map((option) => option.slug);
          if (optionSlugs.length > 0) {
            varType += ` | ${optionSlugs.join(', ')}`;
          }
        }

        simplifiedTypes.types[typeSlug][slug] = varType;
      });
    }

    return simplifiedTypes;
  };
}

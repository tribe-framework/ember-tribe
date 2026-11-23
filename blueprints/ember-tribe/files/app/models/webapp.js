import Model, { attr } from '@warp-drive/legacy/model';

export default class WebappModel extends Model {
  @attr slug;
  @attr modules;
}

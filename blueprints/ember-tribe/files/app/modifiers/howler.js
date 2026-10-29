import Modifier from 'ember-modifier';
import { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';

export default class HowlerModifier extends Modifier {
  @service audioPlayer;

  constructor(owner, args) {
    super(owner, args);
    registerDestructor(this, () => this.audioPlayer.unload());
  }

  modify(element, [src]) {
    this.audioPlayer.load(src);
  }
}

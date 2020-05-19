import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  @service game;
  compute([key, property]) {
    return this.game.tricks[key][property];
  }
}

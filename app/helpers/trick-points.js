import Helper from '@ember/component/helper';
import { inject as service } from '@ember/service';

export default class extends Helper {
  @service game;
  compute([level]) {
    return this.game.levels['lv' + level].points;
  }
}

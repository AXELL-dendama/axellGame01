import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChooseLevelStep1Controller extends Controller {
  @service game;
  @service router;

  @tracked levelType = this.game.levelType; // 0 based index

  // update level type
  @action selectLevelType(type) {
    this.levelType = type;
    this.select();
  }

  @action prevLevelType() {
    const type = this.levelType;
    this.levelType = type - 1 > 0 ? type - 1 : 3;
  }

  @action nextLevelType() {
    const type = this.levelType;
    this.levelType = type + 1 <= 3 ? type + 1 : 1;
  }

  @action select() {
    console.log(`selected, go to the next route with levelType ${this.levelType}`);
    this.game.levelType = this.levelType;
    this.router.transitionTo('choose-level.step2');
  }

  // handle arcade buttons
  @action handleArcadeButton(button) {
    if (button === 'up') {
      this.select();
    }

    if (button === 'left') {
      this.prevLevelType();
    }

    if (button === 'right') {
      this.nextLevelType();
    }

    if (button === 'down') {
      this.router.transitionTo('choose-players');
    }
  }

  reset() {
    this.levelType = this.game.levelType;
  }
}

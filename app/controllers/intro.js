import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class IntroController extends Controller {
  @service router;
  @service game;

  // players count selected, move on
  @action handleArcadeButton(button) {
    if (button === 'up') {
      this.router.transitionTo('choose-players');
    }
  }

  reset() {
    this.game.reset();
  }
}

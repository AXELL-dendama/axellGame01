import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class IntroRoute extends Route {
  @service game;

  actions = {
    didTransition() {
      this.game.reset();
      return true;
    }
  }
}

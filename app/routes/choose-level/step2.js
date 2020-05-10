import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChooseLevelStep2Route extends Route {
  @service game;

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.reset();
  }
}

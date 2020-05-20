import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import { run } from '@ember/runloop';
import PubSub from 'pubsub-js';

export default class ApplicationRoute extends Route {
  @service router;
  @service game;

  pubsubTokens = [];
  coldBoot = true;

  subscribeArcadeButtons = function(controller) {
    if (controller?.handleArcadeButton) {
      const token = PubSub.subscribe('ARCADE_BUTTON', (msg, button) => {
        controller.handleArcadeButton(button);
      });
      this.pubsubTokens.push(token);
    }
  }

  actions = {
    didTransition() {
      run.schedule('render', () => {
        if (this.coldBoot) {
          this.coldBoot = false;

          if (this.router.currentRouteName !== 'intro' && !this.game.players.length) {
            return this.transitionTo('intro');
          }
        }

        const currentController = this.controllerFor(this.router.currentRouteName);
        this.subscribeArcadeButtons(currentController);
        if (currentController.reset) {
          currentController.reset();
        }
      });
    },

    willTransition() {
      if (this.pubsubTokens) {
        this.pubsubTokens.forEach((token) => {
          PubSub.unsubscribe(token);
        })
      }
    }
  }
}

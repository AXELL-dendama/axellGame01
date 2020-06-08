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
        // booting app for the first time
        if (this.coldBoot) {
          this.coldBoot = false;

          // add players from `game_settings` variable
          const imported = this.game.importPlayersFromSettings();
          if (imported && this.router.currentRouteName == 'intro') {
            console.log('importPlayersFromSettings');
            this.router.transitionTo('choose-level');
          }

          // go to intro
          if (!imported && this.router.currentRouteName !== 'intro' && !this.game.players.length) {
            console.log('transition to intro');
            this.router.transitionTo('intro');
          }
        }

        // subscribe arcade buttons
        console.log('route/application.js subscribe arcade buttons', this.router.currentRouteName);
        const currentController = this.controllerFor(this.router.currentRouteName);
        this.subscribeArcadeButtons(currentController);

        // reset controllers data
        if (currentController.reset) {
          currentController.reset();
        }
      });
    },

    willTransition() {
      // unsubscribe arcade buttons
      if (this.pubsubTokens) {
        this.pubsubTokens.forEach((token) => {
          PubSub.unsubscribe(token);
        })
      }
    }
  }
}

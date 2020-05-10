import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import PubSub from 'pubsub-js';

export default class ApplicationController extends Controller {
  @service game;

  @action triggerArcadeButton(button) {
    PubSub.publish('ARCADE_BUTTON', button);
  }
}

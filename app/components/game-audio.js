import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import config from '../config/environment';

export default class GameAudioComponent extends Component {
  @service game;
  rootUrl = config.rootURL;

  @action didInsert(element) {
    element.volume = 0.2;
    element.addEventListener('canplaythrough', () => element.play());
    this.game.audioElement = element;
  }
}

import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import config from '../config/environment';

export default class PlayersRowComponent extends Component {
  @service game;

  rootURL = config.rootURL;

  get players() {
    return this.args.players || this.game.players;
  }
}

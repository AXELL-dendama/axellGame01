import Component from '@glimmer/component';
import { inject as service } from '@ember/service';

export default class PlayersRowComponent extends Component {
  @service game;

  get players() {
    return this.args.players || this.game.players;
  }
}

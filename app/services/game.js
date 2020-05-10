import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from '../config/environment';

export default class GameService extends Service {
  @tracked playersCount = 1;
  @tracked levelType = 1;
  @tracked players = [];

  levels = config.APP.gameLevels;
  tricks = config.APP.gameTricks;

  reset() {
    this.playersCount = 1;
    this.levelType = 1;
    this.players = [];
  }
}

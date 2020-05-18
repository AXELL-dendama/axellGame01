import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from '../config/environment';

export default class GameService extends Service {
  @tracked levelType = 1;
  @tracked players = [];

  get playersCount() {
    return this.players.length;
  }

  levels = config.APP.gameLevels;
  tricks = config.APP.gameTricks;

  reset() {
    // this.playersCount = 1;
    this.levelType = 1;
    this.players = [];
  }

  newPlayer({ name = '', level = 0, points = 0 }) {
    const player = { @tracked name: '', @tracked level: 0, @tracked points: 0 };
    player.name = name;
    player.level = level;
    player.points = points;
    return player;
  }

  setPlayers(players = []) {
    const trackedPlayers = players.map(this.newPlayer);
    this.players = trackedPlayers;
    return this.players;
  }
}

import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import config from '../config/environment';
import { inject as service } from '@ember/service';

export default class GameService extends Service {
  @service router;

  @tracked levelType = 1;
  @tracked players = [];

  get playersCount() {
    return this.players.length;
  }

  levels = config.APP.gameLevels;
  tricks = config.APP.gameTricks;

  reset() {
    this.levelType = 1;
    this.players = [];
  }

  newPlayer({ name = '', level = 0, points = 0 }) {
    // track properties
    const player = {
      @tracked name: '',
      @tracked level: 0,
      @tracked points: 0
    };

    // update properties with arguments
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

  // add players from `game_settings` variable
  // @TODO: import names & rating
  importPlayersFromSettings() {
    const importPlayers = window.game_settings?.participant;
    if (!importPlayers) {
      return false;
    }

    const players = [];
    for (let i in importPlayers) {
      if (importPlayers[i]) {
        const player = this.newPlayer({
          name: 'PLAYER' + i,
          // @TODO: remove level
          level: 1,
          // @TODO: remove points
          points: 100
        });
        players.push(player);
      }
    }
    return this.setPlayers(players);
  }
}

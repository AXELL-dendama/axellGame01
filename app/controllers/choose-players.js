import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import ChooseLevelStep1Controller from './choose-level/step1';
import config from '../config/environment';

export default class ChoosePlayersController extends Controller {
  @service game;
  @service router;

  // number from 1 to 4
  @tracked currentPlayersCount;

  rootURL = config.rootURL;

  @action selectPlayers(count) {
    this.currentPlayersCount = count;
    this.select();
  }

  // decrement playersCount from 4 to 1
  @action prevPlayer() {
    const count = this.currentPlayersCount;
    this.currentPlayersCount = count - 1 > 0 ? count - 1 : 4;
  }

  // increment playersCount from 1 to 4
  @action nextPlayer() {
    const count = this.currentPlayersCount;
    this.currentPlayersCount = count + 1 <= 4 ? count + 1 : 1;
  }

  // players count selected, move on
  @action select() {
    console.log(`selected, go to the next route with count ${this.playersCount}`);

    // create new players array
    const players = [];
    for (let i = 0; i < this.currentPlayersCount; i++) {
      players.push({ name: `PLAYER${i+1}` });
    }

    // update players
    this.game.setPlayers(players);

    this.router.transitionTo('choose-level');
  }

  // handle arcade buttons
  @action handleArcadeButton(button) {
    if (button === 'up') {
      this.select();
    }

    if (button === 'left') {
      this.prevPlayer();
    }

    if (button === 'right') {
      this.nextPlayer();
    }

    if (button === 'down') {
      this.router.transitionTo('intro');
    }
  }

  reset() {
    this.currentPlayersCount = 1;
  }
}

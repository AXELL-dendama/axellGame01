import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChoosePlayersController extends Controller {
  @service game;
  @service router;

  // number from 1 to 4
  @tracked playersCount = this.game.playersCount;

  @action selectPlayers(count) {
    this.playersCount = count;
    this.select();
  }

  // decrement playersCount from 4 to 1
  @action prevPlayer() {
    const count = this.playersCount;
    this.playersCount = count - 1 > 0 ? count - 1 : 4;
  }

  // increment playersCount from 1 to 4
  @action nextPlayer() {
    const count = this.playersCount;
    this.playersCount = count + 1 <= 4 ? count + 1 : 1;
  }

  // players count selected, move on
  @action select() {
    console.log(`selected, go to the next route with count ${this.playersCount}`);
    this.game.playersCount = this.playersCount;
    this.router.transitionTo('choose-level');
  }

  // handle arcade buttons
  @action handleArcadeButton(button) {
    if (button === 'green') {
      this.select();
    }

    if (button === 'left') {
      this.prevPlayer();
    }

    if (button === 'right') {
      this.nextPlayer();
    }

    if (button === 'red') {
      this.router.transitionTo('intro');
    }
  }

  reset() {
    this.playersCount = this.game.playersCount;
  }
}

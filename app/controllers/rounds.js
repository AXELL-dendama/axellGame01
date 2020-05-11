import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RoundsController extends Controller {
  @service router;
  @service game;

  @tracked showMenu = false;
  @tracked showRoundTitle = true;
  @tracked currentRound = 1;
  @tracked currentPlayer = 0;
  @tracked currentPoints = 0;
  @tracked tricks = [];
  @tracked remainingTime = 30;

  get currentPlayerName() {
    return this.game.players[this.currentPlayer].name;
  }

  // players count selected, move on
  @action handleArcadeButton(button) {
    if (button === 'green') {
      this.router.transitionTo('choose-players');
    }
  }

  @action animateIntro(element) {
    console.log(element);

    element.querySelector('h1.round-title').classList.remove('hidden');

    setTimeout(() => {
      element.querySelector('span.round').classList.add('hidden');
      element.querySelector('span.name').classList.remove('hidden');
    }, 500);

    setTimeout(() => {
      element.querySelector('span.round').classList.remove('hidden');
      element.querySelector('span.name').classList.add('hidden');
      element.querySelector('h1.round-title').classList.add('hidden');
    }, 1000);
  }

  @action toggleMenu(bool) {
    console.log('toggleMenu', bool);
    this.showMenu = bool;
  }

  reset() {
    const { level, points } = this.game.players[0];

    this.currentRound = 1;
    this.currentPlayer = 0;
    this.showRoundTitle = true;
    this.remainingTime = 30;
    this.currentPoints = points;
    this.allTricks = [];

    for (let i = 1; i <= level; i++) {
      const key = `lv${i}`;
      console.log(key, this.game.levels[key]);

      this.game.levels[key].forEach((trickKey) => {
        if (!Array.isArray(trickKey)) {
          const trick = this.game.tricks[trickKey];
          this.allTricks.push({
            ...trick,
            level: i
          });
        }
      })
    }

    this.tricks = [...this.allTricks].sort(() => Math.random() - 0.5);
    this.tricks = this.tricks.slice(0, 3);
  }
}

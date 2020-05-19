import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class RoundsController extends Controller {
  @service router;
  @service game;

  @tracked currentRound;
  @tracked currentPlayer;
  @tracked remainingTime;
  @tracked currentPoints;
  @tracked showRoundTitle;
  @tracked showMenu;
  @tracked showMenuButton;
  @tracked showStartPrompt;
  @tracked showTimer;
  @tracked tricks = [];

  @tracked editingTricks;
  @tracked currentTrick;
  @tracked showEditConfirmation;

  maxRounds = 5;

  get currentPlayerName() {
    return this.game.players[this.currentPlayer]?.name;
  }

  @action startRound() {
    alert('start round');
  }

  @action startEditTricks() {
    console.log('startEditTricks');
    this.editingTricks = true;
    this.showStartPrompt = false;
    this.showEditConfirmation = false;
    this.currentTrick = 0;
  }

  @action endEditTricks() {
    console.log('endEditTricks');
    this.showEditConfirmation = false;
    this.editingTricks = false;
    this.currentTrick = 0;
  }

  @action nextTrickInQueue() {
    const trick = this.tricks[this.currentTrick];
    const { current: index, key, queue } = trick;
    const newIndex = index >= queue.length - 1 ? 0 : index + 1;
    const newKey = queue[newIndex];

    // update trick
    trick.current = newIndex;
    trick.key = newKey;
  }

  @action prevTrickInQueue() {
    const trick = this.tricks[this.currentTrick];
    const { current: index, key, queue } = trick;
    const newIndex = index <= 0 ? queue.length - 1 : index - 1;
    const newKey = queue[newIndex];

    // update trick
    trick.current = newIndex;
    trick.key = newKey;
  }

  @action editNextTrick() {
    const index = this.currentTrick;
    this.currentTrick = index >= this.tricks.length - 1 ? 0 : index + 1;
  }

  @action editPrevTrick() {
    const index = this.currentTrick;
    this.currentTrick = index <= 0 ? this.tricks.length - 1 : index - 1;
  }

  @action editSelect() {
    if (this.currentTrick + 1 < this.tricks.length) {
      this.editNextTrick();
    } else if (!this.showEditConfirmation) {
      this.showEditConfirmation = true;
      this.currentTrick = undefined;
    } else {
      this.endEditTricks();
    }
  }

  // players count selected, move on
  @action handleArcadeButton(button) {
    if (this.showStartPrompt) {
      if (button === 'green') {
        this.startRound();
      }

      if (button === 'red') {
        this.startEditTricks();
      }
    }

    if (this.editingTricks) {
      switch(button) {
        case 'green':
          this.editSelect();
          break;
        case 'left':
          this.prevTrickInQueue();
          break;
        case 'right':
          this.nextTrickInQueue();
          break;
        case 'red':
          if (!this.showEditConfirmation) {
            if (this.currentTrick > 0) {
              this.editPrevTrick();
            }
          } else {
            this.startEditTricks();
          }
          break;
      }
    }
  }

  @action animateIntro(element) {
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
    this.showMenu = bool;
  }

  reset() {
    const currentLevel = this.game.players[0]?.level;
    const points = this.game.players[0]?.points;

    if (!this.game.players || !this.game.players[0] || !currentLevel) {
      return this.router.transitionTo('intro');
    }

    this.currentRound = 1;
    this.currentPlayer = 0;
    this.remainingTime = 30;
    this.currentPoints = points;

    this.showRoundTitle = true;

    this.showMenu = false;
    this.showMenuButton = false;
    this.showStartPrompt = true;
    this.showTimer = false;
    this.editingTricks = false;
    this.showEditConfirmation = false;

    this.currentTrick = 0;

    const level = this.game.levels['lv' + currentLevel];
    let tricks = level.tricks.map((key) => {
      const trick = { @tracked current: undefined, @tracked key: undefined, queue: [] };
      trick.queue = this.game.tricks[key].queue;
      trick.key = key;
      trick.current = trick.queue.indexOf(key);
      return trick;
    });
    tricks = tricks.sort(() => Math.random() - 0.5).slice(0, 3);

    this.tricks = tricks;
  }
}

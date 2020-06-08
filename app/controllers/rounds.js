import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { task } from 'ember-concurrency-decorators';

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
  @tracked tricks = [];

  @tracked editingTricks;
  @tracked currentTrick;
  @tracked showEditConfirmation;
  @tracked showStartCountdown;
  @tracked startCountdown;
  @tracked showRoundCountdown;
  @tracked roundCountdown;

  maxRounds = 5;
  roundCountdownPaused = true;
  startCountdownDefault = 3;
  roundCountdownDefault = 30;

  get currentPlayerName() {
    return this.game.players[this.currentPlayer]?.name;
  }

  @action startRound() {
    this.startRoundTask.perform();
  }

  @task *startRoundTask() {
    console.log('start round');
    this.showStartPrompt = false;
    this.showStartCountdown = true;
    this.showRoundCountdown = true;
    this.showMenuButton = true;

    yield this.animateStartCountdown.perform();
    yield this.animateRoundCountdown.perform();
    console.log('player round ended; try the next one');
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
    this.startRound();
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

  @action startEditPoints() {
    console.log('startEditPoints');
  }

  @action retryRound() {
    console.log('retryRounds');
    this.startCountdown = this.startCountdownDefault;
    this.roundCountdown = this.roundCountdownDefault;
    this.showMenu = false;
    this.startRound();
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
    if (this.showMenuButton) {
      if (button === 'down') {
        // this.startEditTricks();
        this.openMenu();
        return;
      }
    }

    if (this.showStartPrompt) {
      if (button === 'up') {
        this.startRound();
      }

      if (button === 'down') {
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

  @task *animateIntroTask(element) {
    element.querySelector('h1.round-title').classList.remove('hidden');
    yield timeout(500);
    element.querySelector('span.round').classList.add('hidden');
    element.querySelector('span.name').classList.remove('hidden');
    yield timeout(500);
    element.querySelector('span.round').classList.remove('hidden');
    element.querySelector('span.name').classList.add('hidden');
    element.querySelector('h1.round-title').classList.add('hidden');
  }

  @action animateIntro(element) {
    this.animateIntroTask.perform(element);
  }

  @task *animateStartCountdown() {
    console.log('animateStartCountdown');
    for (let i = this.startCountdown; i > 0; i--) {
      this.startCountdown = i;
      yield timeout(1000);
    }
    this.showStartCountdown = false;
    this.roundCountdownPaused = false;
  }

  @task *animateRoundCountdown() {
    console.log('animateRoundCountdown', this.roundCountdownPaused);
    this.roundCountdown = this.roundCountdownDefault;
    for (let i = this.roundCountdown; i > 0; i--) {
      this.roundCountdown = i;
      yield timeout(1000);
    }
    console.log('animatedRoundCountdown ended');
  }

  @action toggleMenu(bool) {
    this.showMenu = bool;
  }

  @action openMenu() {
    console.log('openMenu');
    this.showMenu = true;
    this.animateStartCountdown.cancelAll();
    this.animateRoundCountdown.cancelAll();
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

    // this.showMenu = false;
    this.showMenuButton = false;
    this.showStartPrompt = true;
    this.editingTricks = false;
    this.showEditConfirmation = false;

    this.currentTrick = 0;
    this.showStartCountdown = false;
    this.startCountdown = this.startCountdownDefault;
    this.roundCountdown = this.roundCountdownDefault;

    this.roundCountdownPaused = true;

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

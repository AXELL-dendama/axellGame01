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
  @tracked currentPoints;

  @tracked showMenu;
  @tracked showMenuButton;
  @tracked showStartPrompt;
  @tracked showEditConfirmation;
  @tracked showStartCountdown;
  @tracked showRoundCountdown;

  @tracked tricks;
  @tracked editingTricks;
  @tracked currentTrick;

  @tracked startCountdown;
  @tracked roundCountdown;

  maxRounds = 5;
  startCountdownDefault = 3;
  roundCountdownDefault = 30;
  isPlaying = false;
  bannerEl = undefined;

  get currentPlayerName() {
    return this.game.players[this.currentPlayer]?.name;
  }

  setCurrentPlayer(index) {
    this.currentPlayer = index;
    this.currentPoints = this.game.players[this.currentPlayer].points;
    this.setInitialPlayerTricks(index);
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

    // start initial countdown
    yield this.animateStartCountdownTask.perform();

    // start player round
    this.isPlaying = true;
    yield this.animateRoundCountdownTask.perform();
    console.log('player round ended; try the next one');
  }

  @task *nextRoundPlayerTask() {
    // stop counter
    this.animateRoundCountdownTask.cancelAll();

    // save current player's points
    this.game.players[this.currentPlayer].points = this.currentPoints;

    // go to the next player
    const nextPlayer = this.currentPlayer + 1 < this.game.players.length ? this.currentPlayer + 1 : 0;
    const isNextRound = nextPlayer === 0;
    const round = isNextRound ? this.currentRound + 1 : this.currentRound;
    console.log('nextRoundPlayerTask', { nextPlayer, isNextRound, round });

    // go to next player or round
    if (round <= this.maxRounds) {
      this.setCurrentPlayer(nextPlayer);
      this.resetRound(round);
      yield this.animateBannerTask.perform(isNextRound);

    // @TODO end game, show results
    } else {
      console.log('end game');
    }
  }

  @action startEditTricks() {
    console.log('startEditTricks');
    this.editingTricks = true;
    this.showStartPrompt = false;
    this.showEditConfirmation = false;
    this.currentTrick = 0;
  }

  endEditTricks() {
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

  editNextTrick() {
    const index = this.currentTrick;
    this.currentTrick = index >= this.tricks.length - 1 ? 0 : index + 1;
  }

  editPrevTrick() {
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
  handleArcadeButton(button) {
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
        case 'up':
          this.editSelect();
          break;
        case 'left':
          this.prevTrickInQueue();
          break;
        case 'right':
          this.nextTrickInQueue();
          break;
        case 'down':
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

  handleDendama(finalTrick) {
    this.handleDendamaTask.perform(finalTrick);
  }

  @task *handleDendamaTask(finalTrick) {
    if (!this.isPlaying) {
      return;
    }

    // find if there's a trick that matches finalTrick
    let trick = this.tricks.find((trick) => trick.key === finalTrick);

    // debug mode: find any trick that isn't cleared
    if (finalTrick === 'debug') {
      trick = this.tricks.find((trick) => !trick.cleared);
    }

    // player got a new trick
    if (trick && !trick.cleared) {
      trick.cleared = true;
      console.log('player got a new trick', { trick });

      // @TODO: show success message  https://xd.adobe.com/view/2f489957-660a-4605-6231-801cbd6af7f3-5979/screen/81d5e577-23bd-4ece-b1e3-838c8c5575cf/-
      // @TODO: handle bonus time?  https://xd.adobe.com/view/2f489957-660a-4605-6231-801cbd6af7f3-5979/screen/961c492f-55cb-45db-bbb4-de198001a711/-
      // @TODO: show big success animation  https://xd.adobe.com/view/2f489957-660a-4605-6231-801cbd6af7f3-5979/screen/e1e5542f-dbd4-4ebd-b676-51458f905c90/-

      // @TODO: tricks have a timeLimit (???)


      // update current points
      // @TODO: handle negative points
      const { level } = this.game.tricks[trick.key];
      const points = this.game.levels['lv' + level].points;
      this.currentPoints = this.currentPoints - points;

      // @TODO: show crown

      // end of player round
      const unclearedTricks = this.tricks.filter((trick) => !trick.cleared);
      if (!unclearedTricks.length) {
        // stop counter
        this.animateRoundCountdownTask.cancelAll();

        // stop receiving events from dendama
        this.isPlaying = false;

        // pause for a second to display cleared messages
        yield timeout(1000);

        // save points and go to the next player
        yield this.nextRoundPlayerTask.perform();
      }
    }
  }

  @action didInsertBanner(element) {
    this.bannerEl = element;
    this.animateBannerTask.perform(true);
  }

  @task *animateBannerTask(showRound) {
    console.log('animateBannerTask', { showRound });
    const element = this.bannerEl;

    element.classList.remove('hidden');

    if (showRound) {
      element.querySelector('span.round').classList.remove('hidden');
      yield timeout(1000);
      element.querySelector('span.round').classList.add('hidden');
    }

    element.querySelector('span.name').classList.remove('hidden');
    yield timeout(1000);
    element.querySelector('span.name').classList.add('hidden');
    element.classList.add('hidden');
  }

  @task *animateStartCountdownTask() {
    console.log('animateStartCountdown');
    this.startCountdown = this.startCountdownDefault;
    const startTime = new Date();

    let counting = true;
    while (counting) {
      const currentTime = new Date();
      const seconds = this.startCountdownDefault - ((currentTime - startTime) / 1000);

      if (seconds <= 0) {
        counting = false;
      } else {
        // update template with 3, 2, 1
        this.startCountdown = Math.ceil(seconds);
      }

      yield timeout(16.66);
    }

    this.showStartCountdown = false;
  }

  @task *animateRoundCountdownTask() {
    this.roundCountdown = this.roundCountdownDefault;
    for (let i = this.roundCountdown; i > 0; i--) {
      this.roundCountdown = i;
      yield timeout(1000);
    }
    console.log('animatedRoundCountdown ended');
    // @TODO: end round
  }

  @action toggleMenu(bool) {
    this.showMenu = bool;
  }

  @action openMenu() {
    console.log('openMenu');
    this.showMenu = true;
    this.animateStartCountdownTask.cancelAll();
    this.animateRoundCountdownTask.cancelAll();
    // @TODO: handle pause / resume state
  }

  setInitialPlayerTricks(playerIndex) {
    const currentLevel = this.game.players[playerIndex].level;
    const level = this.game.levels['lv' + currentLevel];
    let tricks = level.tricks.map((key) => {
      const trick = { @tracked cleared: undefined, @tracked current: undefined, @tracked key: undefined, queue: [] };
      trick.cleared = false;
      trick.queue = this.game.tricks[key].queue;
      trick.key = key;
      trick.current = trick.queue.indexOf(key);
      return trick;
    });
    tricks = tricks.sort(() => Math.random() - 0.5).slice(0, 3);

    this.tricks = tricks;
  }

  resetRound(round) {
    this.currentRound = round;
    this.roundCountdown = this.roundCountdownDefault;
    this.showStartPrompt = true;
    this.showMenuButton = false;
    this.showStartCountdown = false;
    this.showRoundCountdown = false;
    this.startCountdown = this.startCountdownDefault;
    this.roundCountdown = this.roundCountdownDefault;
    this.isPlaying = false;
    this.showMenu = false;
  }

  resetTrickEditing() {
    this.editingTricks = false;
    this.currentTrick = 0;
    this.showEditConfirmation = false;
  }

  reset() {
    // no users, go to intro
    const currentLevel = this.game.players[0]?.level;
    if (!this.game.players || !this.game.players[0] || !currentLevel) {
      return this.router.transitionTo('intro');
    }

    // start reset here
    this.resetTrickEditing();
    this.resetRound(1);
    this.setCurrentPlayer(0);
    this.setInitialPlayerTricks(this.currentPlayer);
  }
}

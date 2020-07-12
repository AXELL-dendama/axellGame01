import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { timeout } from 'ember-concurrency';
import { task, restartableTask } from 'ember-concurrency-decorators';
import config from '../config/environment';

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
  @tracked showSuccessMessage;
  @tracked showRoundEndedMessage;
  @tracked showBonusPoints;
  @tracked showTrickChallenge;
  @tracked showModifyingPoints;

  @tracked tricks;
  @tracked editingTricks;
  @tracked currentTrick;
  @tracked trickChallenge;

  @tracked startCountdown;
  @tracked roundCountdown;

  @tracked currentMenuOption;
  @tracked currentModifyingRound;
  @tracked currentModifyingPlayer;
  @tracked currentModifyingTricks;

  rootURL = config.rootURL;
  maxRounds = 5;
  bonusPoints = 20;
  startCountdownDefault = 3;
  roundCountdownDefault = 30;
  isPlaying = false;
  bannerEl = undefined;
  history = {};

  get currentPlayerName() {
    return this.game.players[this.currentPlayer]?.name;
  }

  get currentModifyingPlayerName() {
    return this.game.players[this.currentModifyingPlayer]?.name;
  }

  setHistoricalPoints() {
    if (!this.history['round' + this.currentRound]) {
      this.history['round' + this.currentRound] = [];
    }

    let bonus = true;
    const tricks = this.tricks.map((trick) => {
      const { level } = this.game.tricks[trick.key];
      const { points } = this.game.levels['lv' + level];
      const { key, cleared } = trick;

      if (!trick.cleared) {
        bonus = false;
      }

      return {
        @tracked key,
        @tracked cleared,
        @tracked points
      };
    });

    const bonusPoints = (bonus) ? this.bonusPoints : 0;
    const points = this.currentPoints - bonusPoints;

    this.history['round' + this.currentRound][this.currentPlayer] = {
      tricks,
      points,
      bonusPoints
    };
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

    // save historical points grouped by round and player, used on modify points feature
    this.setHistoricalPoints();

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

    // end game, show results
    } else {
      console.log('end game');
      // @TODO show winner message
      // yield timeout(1000);
      this.router.transitionTo('results');
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
    this.showModifyingPoints = true;
    this.currentMenuOption = 0;
  }

  @action showModifyCurrentPlayerPoints() {
    const player = this.currentPlayer;
    this.currentModifyingPlayer = player;
    this.currentModifyingRound = this.currentRound;
    this.currentModifyingTricks = this.tricks.map((t) => {
      const trick = {
        @tracked cleared: false,
        key: ''
      };

      trick.cleared = t.cleared;
      trick.key = t.key;

      return trick;
    });
    console.log(player, this.currentModifyingTricks);
  }

  @action showModifyPreviousPlayerPoints() {
    // disable on 1st round + 1st player
    if (this.currentRound === 1 && this.currentPlayer === 0) {
      return;
    }

    this.currentMenuOption = 0;

    let player;
    let round;

    if (this.currentPlayer -1 < 0) {
      player = this.game.players.length - 1;
      round = this.currentRound - 1;
    } else {
      player = this.currentPlayer - 1;
      round = this.currentRound;
    }

    this.currentModifyingPlayer = player;
    this.currentModifyingRound = round;
    this.currentModifyingTricks = this.history['round' + round][player].tricks;
    console.log(player, round);
  }

  @task *modifyPoints() {
    console.log('end modify points');
    console.log(this.currentModifyingPlayer);
    console.log(this.currentModifyingTricks);

    // current player
    if (this.currentPlayer === this.currentModifyingPlayer) {
      let bonus = true;
      let points = this.game.players[this.currentModifyingPlayer].points;
      let trick;

      this.currentModifyingTricks.forEach((t, i) => {
        // update trick
        this.tricks[i].cleared = t.cleared;

        // get points values
        if (t.cleared) {
          const { level } = this.game.tricks[t.key];
          points -= this.game.levels['lv' + level].points;
          trick = t;

        // failed at least 1 trick - no bonus points
        } else {
          bonus = false;
        }
      });

      if (bonus) {
        points -= this.bonusPoints;
        this.showMenu = false;
        this.showStartCountdown = false;
      }

      // handle challenge trick
      if (points <= 0) {
        console.log('TODO: handle challenge trick');
        this.showStartCountdown = true;
        this.setupTrickChallenge();
        yield this.animateStartCountdownTask.perform();
        yield this.animateRoundCountdownTask.perform();
        return;
      }

      // update points
      this.currentPoints = points;

      // end turn
      if (bonus) {
        // show full page animation
        yield this.animateRoundEndedTask.perform();

        // save points and go to the next player
        yield this.nextRoundPlayerTask.perform();
      }

    // previous player
    } else {
      const userRound = this.history['round' + this.currentModifyingRound][this.currentModifyingPlayer];
      const { startingPoints } = this.game.players[this.currentModifyingPlayer];

      let bonusPoints = this.bonusPoints;
      let totalPoints = 0;
      let points = 0;

      // get modified points
      this.currentModifyingTricks.forEach((trick, i) => {
        userRound.tricks[i].cleared = trick.cleared;
        if (trick.cleared) {
          points += userRound.tricks[i].points;
        } else {
          bonusPoints = 0;
        }
      });

      // update w/ bonus points
      points += bonusPoints;

      // update historical points
      userRound.points = points;
      userRound.bonusPoints = bonusPoints;

      // get new total from all rounds
      Object.keys(this.history).forEach((roundKey) => {
        const p = this.history[roundKey][this.currentModifyingPlayer];
        if (p && p.points) {
          totalPoints += p.points;
        }
      });

      console.log({ points, bonusPoints, totalPoints, startingPoints })

      // update total points
      this.game.players[this.currentModifyingPlayer].points = startingPoints - totalPoints;
    }

    // close menu
    this.currentMenuOption = 0;
    this.currentModifyingPlayer = undefined;
    this.showModifyingPoints = false;
  }

  @action toggleTrickCleared(trick) {
    if (!trick) {
      trick = this.currentModifyingTricks[this.currentMenuOption];
    }
    trick.cleared = !trick.cleared;
  }

  @action modifyNextTrick() {
    const index = this.currentMenuOption;
    const max = this.currentModifyingTricks.length;

    // no more tricks available - save
    if (index + 1 >= max) {
      this.modifyPoints.perform();
      return;
    }

    this.currentMenuOption = index + 1 < max ? index + 1 : 0;
  }

  @action modifyPrevTrick() {
    const index = this.currentMenuOption;
    const max = this.currentModifyingTricks.length - 1;
    this.currentMenuOption = index - 1 >= 0 ? index - 1 : max;
  }

  prevMenuOption() {
    if (this.showModifyingPoints) {
      // toggle trick status
      if (this.currentModifyingPlayer !== undefined) {
        this.toggleTrickCleared();
        return;
      // disable on 1st round + 1st player
      } else if (this.currentRound === 1 && this.currentPlayer === 0) {
        this.currentMenuOption = 0;
        return;
      }
    }

    const index = this.currentMenuOption;
    let max = this.showModifyingPoints ? 1 : 3;
    this.currentMenuOption = index - 1 >= 0 ? index - 1 : max;
  }

  nextMenuOption() {
    if (this.showModifyingPoints) {
      // toggle trick status
      if (this.currentModifyingPlayer !== undefined) {
        this.toggleTrickCleared();
        return;
      // disable on 1st round + 1st player
      } else if (this.currentRound === 1 && this.currentPlayer === 0) {
        this.currentMenuOption = 0;
        return;
      }
    }

    const index = this.currentMenuOption;
    const max = this.showModifyingPoints ? 1 : 3;
    this.currentMenuOption = index + 1 <= max ? index + 1 : 0;
  }

  @task *resumeRoundTask() {
    console.log('resumeRound');
    this.showMenu = false;

    // if we still havent started the round, restart the countdown
    if (this.showStartCountdown) {
      yield this.animateStartCountdownTask.perform();
    }

    // resume player round
    this.isPlaying = true;
    yield this.animateRoundCountdownTask.perform();
  }

  @action retryRound() {
    console.log('retryRound');
    // reset points
    this.currentPoints = this.game.players[this.currentPlayer].points;

    // reset tricks cleared status
    this.tricks.forEach((trick) => {
      trick.cleared = false;
    });

    // reset and start round
    this.resetRound(this.currentRound);
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

  handleArcadeButton(button) {
    if (!this.animateBannerTask.isIdle) {
      return;
    }

    if (this.showMenuButton && !this.showMenu) {
      if (button === 'down') {
        this.openMenu();
        return;
      }
    }

    if (this.showMenu) {
      if (button === 'left') {
        return this.prevMenuOption();
      }

      if (button === 'right') {
        return this.nextMenuOption();
      }

      if (button === 'up') {
        // editing points
        if (this.showModifyingPoints) {
          // choose player
          if (this.currentModifyingPlayer === undefined) {
            switch (this.currentMenuOption) {
              case 0:
                return this.showModifyCurrentPlayerPoints();
              case 1:
                return this.showModifyPreviousPlayerPoints();
            }
          // modify player
          } else {
            this.modifyNextTrick();
          }

        // default
        } else {
          switch (this.currentMenuOption) {
            case 0:
              return this.resumeRoundTask.perform();
            case 1:
              return this.router.transitionTo('intro');
            case 2:
              return this.startEditPoints();
            case 3:
              return this.retryRound();
          }
        }
      }

      if (button === 'down') {
        if (this.showModifyingPoints) {
          if (this.currentModifyingPlayer === undefined) {
            this.showModifyingPoints = false;
            this.currentMenuOption = 0;
            this.currentModifyingPlayer = undefined;
            return;
          } else {
            // go back to choosing a player
            if (this.currentMenuOption === 0) {
              this.currentModifyingPlayer = undefined;
            // select previous trick
            } else {
              this.currentMenuOption--;
            }
            return;
          }
        } else {
          return this.resumeRoundTask.perform();
        }
      }
      return;
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
    // ignore dendama events if we aren't playing
    if (!this.isPlaying) {
      return;
    }

    // handle trick challenge
    if (this.showTrickChallenge) {
      yield this.handleTrickChallengeTask.perform(finalTrick);

      // end game
      this.router.transitionTo('results');
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
      yield this.handleClearedTrickTask.perform(trick);
    }
  }

  @task *handleClearedTrickTask(trick) {
    trick.cleared = true;
    console.log('player got a new trick', { trick });

    // show success message
    this.animateSuccessMessage.perform();

    // calculate points earned
    const { level } = this.game.tricks[trick.key];
    const clearedTrickPoints = this.game.levels['lv' + level].points;
    let points = this.currentPoints - clearedTrickPoints;

    // add bonus points
    const unclearedTricks = this.tricks.filter((trick) => !trick.cleared);
    if (!unclearedTricks.length) {
      this.showBonusPoints = true;
      points = points - this.bonusPoints;
    }

    // player is past 0 - show trick challenge
    if (points <= 0) {
      // stop counter
      this.animateRoundCountdownTask.cancelAll();

      // pause for a second to display cleared messages
      yield timeout(1250);

      this.showStartCountdown = true;
      this.setupTrickChallenge();
      yield this.animateStartCountdownTask.perform();

      // start round countdown
      yield this.animateRoundCountdownTask.perform();
      return;
    }

    // update points
    this.currentPoints = points;

    // end of player round
    if (this.showBonusPoints) {
      // stop counter
      this.animateRoundCountdownTask.cancelAll();

      // stop receiving events from dendama
      this.isPlaying = false;

      // pause for a second to display cleared messages
      yield timeout(1250);

      // show full page animation
      yield this.animateRoundEndedTask.perform();

      // save points and go to the next player
      yield this.nextRoundPlayerTask.perform();
    }
  }

  setupTrickChallenge() {
    // get a random trick based on player's level
    const playerLevel = this.game.players[this.currentPlayer].level;
    const { tricks } = this.game.levels['lv' + playerLevel];
    const randomTrick = tricks[Math.floor(Math.random() * tricks.length)];

    // set trick challenge and update UI
    this.trickChallenge = { @tracked cleared: false, @tracked key: randomTrick };
    this.showTrickChallenge = true;

    // set round countdown to challenge trick
    this.roundCountdown = this.game.tricks[randomTrick].timeLimit;

    // @TODO show trick challenge message
    // yield ....
  }

  @task *handleTrickChallengeTask(finalTrick) {
    // console.log('showTrickChallenge', { finalTrick });
    const clearedTrick = finalTrick == 'debug' || finalTrick == this.trickChallenge.key;
    if (!clearedTrick) {
      return;
    }

    // stop counter
    this.animateRoundCountdownTask.cancelAll();

    // show success message
    this.animateSuccessMessage.perform();

    // update trick
    this.trickChallenge.cleared = true;

    // update points
    this.currentPoints = 0;

    // save historical points grouped by round and player
    this.setHistoricalPoints();

    // update player's points
    this.game.players[this.currentPlayer].points = this.currentPoints;

    // stop receiving events from dendama
    this.isPlaying = false;

    // pause
    yield timeout(1000);

    // @TODO show winner message
    // yield ...
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

  // animations use animate.css
  @restartableTask *animateSuccessMessage() {
    this.showSuccessMessage = false;
    yield timeout();
    this.showSuccessMessage = true;
    yield timeout(1500);
    this.showSuccessMessage = false;
  }

  @task *animateRoundEndedTask() {
    this.showRoundEndedMessage = true;
    yield timeout(3000);
    this.showRoundEndedMessage = false;
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
    for (let i = this.roundCountdown; i > 0; i--) {
      this.roundCountdown = i;
      yield timeout(1000);
    }

    // timer ran out, end round
    // console.log('animatedRoundCountdown ended');
    yield this.nextRoundPlayerTask.perform();
  }

  @action openMenu() {
    console.log('openMenu');
    this.isPlaying = false;
    this.showMenu = true;
    this.currentMenuOption = 0;
    this.animateStartCountdownTask.cancelAll();
    this.animateRoundCountdownTask.cancelAll();
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
    this.startCountdown = this.startCountdownDefault;
    this.roundCountdown = this.roundCountdownDefault;
    this.showStartPrompt = true;
    this.showMenuButton = false;
    this.showStartCountdown = false;
    this.showRoundCountdown = false;
    this.isPlaying = false;
    this.showMenu = false;
    this.showSuccessMessage = false;
    this.showRoundEndedMessage = false;
    this.showBonusPoints = false;
    this.showTrickChallenge = false;
    this.trickChallenge = undefined;
    this.showModifyingPoints = false;
    this.currentModifyingPlayer = undefined;
    this.currentModifyingTricks = [];
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
    this.history = {};
    this.currentMenuOption = 0;
    this.resetTrickEditing();
    this.resetRound(1);
    this.setCurrentPlayer(0);
    this.setInitialPlayerTricks(this.currentPlayer);
  }
}

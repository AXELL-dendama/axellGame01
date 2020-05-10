import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChooseLevelStep1Controller extends Controller {
  @service game;
  @service router;

  @tracked currentLevel = 1;
  @tracked currentPlayer = 0; // base 0 index for players array
  @tracked showConfirmation = false;

  // this values are resetted through the route
  @tracked playerLevels = [];
  @tracked players = [];

  get maxLevel() {
    return Object.keys(this.game.levels).length;
  }

  get tricks() {
    const levelTricks = this.game.levels['lv' + this.currentLevel];

    const mapTrick = (trickId) => {
      // format multiple tricks per row
      if (Array.isArray(trickId)) {
        let enName = '', jaName = '';
        const mapped = trickId.map(mapTrick);
        mapped.forEach((t, i) => {
          console.log(t);
          enName += t.enName;
          enName += i < mapped.length - 1 ? ', ' : '';
          jaName += t.jaName;
        });
        return { enName, jaName };
      }

      // return single trick data
      return this.game.tricks[trickId];
    };

    return levelTricks.map(mapTrick);
  }

  // initialize playerLevels (this only happens once)
  constructor() {
    super(...arguments);
    this.playerLevels = this.players.map((v) => 1);
  }

  @action downLevel() {
    const level = this.currentLevel;
    this.currentLevel = level - 1 > 0 ? level - 1 : this.maxLevel;
  }

  @action upLevel() {
    const level = this.currentLevel;
    this.currentLevel = level + 1 <= this.maxLevel ? level + 1 : 1;
  }

  // FYI - currentPlayer is a zero based index
  @action prevPlayer() {
    // update current player's level
    this.setPlayerLevel(this.currentPlayer, this.currentLevel);

    // change player
    const index = this.currentPlayer;
    const newIndex = index - 1 >= 0 ? index - 1 : this.game.playersCount - 1;

    this.currentPlayer = newIndex;
    this.currentLevel = this.playerLevels[newIndex] ? this.playerLevels[newIndex] : 1;
  }

  @action nextPlayer() {
    // update current player's level
    this.setPlayerLevel(this.currentPlayer, this.currentLevel);

    // change player
    const index = this.currentPlayer;
    const newIndex = index + 1 < this.game.playersCount ? index + 1 : 0;

    this.currentPlayer = newIndex;
    this.currentLevel = this.playerLevels[newIndex] ? this.playerLevels[newIndex] : 1;
  }

  @action select() {
    // all levels are the same
    if (this.game.levelType === 1) {

      // show confirmation
      if (!this.showConfirmation) {
        this.showConfirmation = true;
        return;

      // go to the next screen
      } else {
        // set levels for all users
        this.game.players = this.players.map((player, i) => {
          return {
            name: player.name,
            level: this.currentLevel
          };
        });

        this.showConfirmation = false; // clean up value first
        this.router.transitionTo('choose-start-point');

        console.log(`go to next screen with all users on level ${this.currentLevel}`);
        return;
      }
    }

    // each player chooses their own level
    if (this.game.levelType === 2) {

      // skip to next player if available
      if (this.currentPlayer < this.game.playersCount - 1) {
        // show next player
        this.nextPlayer();
        return;

      // go to the next screen on the last player
      } else {

        // show confirmation
        if (!this.showConfirmation) {
          // update last player's level
          this.setPlayerLevel(this.currentPlayer, this.currentLevel);

          // show confirmation modal
          this.showConfirmation = true;
          return;

        // go to the next screen
        } else {
          // set levels for all users
          this.game.players = this.players.map((player, i) => {
            return {
              name: player.name,
              level: this.playerLevels[i]
            };
          });

          this.showConfirmation = false; // clean up value first
          this.router.transitionTo('choose-start-point');

          console.log(`go to next screen with users on levels ${this.playerLevels.join(',')}`);
          return;
        }
      }
    }
  }

  @action cancelConfirmation() {
    this.showConfirmation = false;

    if (this.game.levelType === 2) {
      this.currentPlayer = 0;
      this.currentLevel = this.playerLevels[0] ? this.playerLevels[0] : 1;
    }
  }

  @action setPlayerLevel(player, level) {
    // save level for current player
    this.playerLevels[player] = level;
  }

  // handle arcade buttons
  @action handleArcadeButton(button) {
    if (button === 'green') {
      this.select();
    }

    if (button === 'left' && !this.showConfirmation) {
      this.downLevel();
    }

    if (button === 'right' && !this.showConfirmation) {
      this.upLevel();
    }

    if (button === 'red') {
      if (this.showConfirmation) {
        return this.cancelConfirmation();
      }

      if (this.game.levelType === 2 && this.currentPlayer > 0) {
        return this.prevPlayer();
      }

      this.router.transitionTo('choose-level.step1');
    }
  }

  reset() {
    const players = [];
    const playerLevels = [];

    for (let i = 0; i < this.game.playersCount; i++) {
      players.push(i + 1);
      playerLevels.push(1);
    }

    this.currentLevel = 1;
    this.currentPlayer = 0;
    this.players = players;
    this.playerLevels = playerLevels;
  }
}

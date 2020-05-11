import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ChooseStartPointController extends Controller {
  @service game;
  @service router;

  @tracked playerPoints = [];
  @tracked currentPlayer = null;
  @tracked currentPoints = 0;
  @tracked showConfirmation = false;
  @tracked showMenu = false;
  @tracked currentMenuOption = 0;
  @tracked players = [];
  @tracked manualMode = false;

  points = [100, 300, 500];

  @action prevPoints() {
    const index = this.currentPoints;
    this.currentPoints = index - 1 >= 0 ? index - 1 : this.points.length - 1;
  }

  @action nextPoints() {
    const index = this.currentPoints;
    this.currentPoints = index + 1 < this.points.length ? index + 1 : 0;
  }

  @action selectPoints(index) {
    this.currentPoints = index;
    this.select();
  }

  @action select() {
    console.log('select', this.currentPlayer, this.points[this.currentPoints]);

    // default mode
    if (!this.manualMode) {
      this.game.players.forEach((player, i) => {
        set(player, 'points', this.points[this.currentPoints]);
      });
      this.game.players = this.game.players;
      this.router.transitionTo('rounds');
      return;
    }

    // start: manual mode
    if (this.currentPlayer < this.game.playersCount - 1) {
      // show next player
      this.nextPlayer();
      return;
    }

    // set last player's points
    this.setPlayerPoints(this.currentPlayer, this.currentPoints);

    // update game players data
    this.game.players.forEach((player, i) => {
      set(player, 'points', this.points[this.playerPoints[i]]);
    });
    this.game.players = this.game.players;

    this.router.transitionTo('rounds');
  }

  @action prevPlayer() {
    // update current player's level
    this.setPlayerPoints(this.currentPlayer, this.currentPoints);

    // change player
    const index = this.currentPlayer;
    const newIndex = index - 1 >= 0 ? index - 1 : this.game.playersCount - 1;

    this.currentPlayer = newIndex;
    this.currentLevel = this.playerPoints[newIndex] ? this.playerPoints[newIndex] : 1;
  }

  @action nextPlayer() {
    // update current player's points
    this.setPlayerPoints(this.currentPlayer, this.currentPoints);

    // change player
    const index = this.currentPlayer;
    const newIndex = index + 1 < this.game.playersCount ? index + 1 : 0;

    this.currentPlayer = newIndex;
    this.currentPoints = this.playerPoints[newIndex] ? this.playerPoints[newIndex] : 0;
  }

  @action setPlayerPoints(playerIndex, pointsIndex) {
    console.log('set player points', playerIndex, pointsIndex);
    this.playerPoints[playerIndex] = pointsIndex;
    set(this.players[playerIndex], 'points', this.points[pointsIndex]);
  }

  @action cancelConfirmation() {
    console.log('cancel', this.currentPlayer, this.currentPoints)
    this.showConfirmation = false;
  }

  @action toggleMenu(bool) {
    console.log('toggleMenu', this.currentPlayer, this.currentPoints)
    this.showMenu = bool;
  }

  reset() {
    const playerPoints = [];

    for (let i = 0; i < this.game.playersCount; i++) {
      playerPoints.push(0);
    }

    this.players = this.game.players.map((player) => {
      return { ...player, points: 0 };
    });

    this.currentPoints = 0;
    this.currentPlayer = null;
    this.playerPoints = playerPoints;
    this.showMenu = false;
    this.currentMenuOption = 0;
    this.manualMode = false;
  }

  @action startManualPoints() {
    console.log('manual mode on');
    this.manualMode = true;
    this.toggleMenu(false);
    this.currentPlayer = 0;
    // @TODO: what's the UI and functionality for this?
  }

  @action prevMenuOption() {
    const index = this.currentMenuOption;
    this.currentMenuOption = index - 1 >= 0 ? index - 1 : 2;
  }

  @action nextMenuOption() {
    const index = this.currentMenuOption;
    this.currentMenuOption = index + 1 <= 2 ? index + 1 : 0;
  }

  // handle arcade buttons
  @action handleArcadeButton(button) {
    if (button === 'green') {
      if (!this.showMenu) {
        this.select();
      } else {
        switch (this.currentMenuOption) {
          case 0:
            return this.toggleMenu(false);
          case 1:
            return this.router.transitionTo('intro');
          case 2:
            return this.startManualPoints();
        }
      }
    }

    if (button === 'left') {
      if (!this.showMenu) {
        this.prevPoints();
      } else {
        this.prevMenuOption();
      }
    }

    if (button === 'right') {
      if (!this.showMenu) {
        this.nextPoints();
      } else {
        this.nextMenuOption();
      }
    }

    if (button === 'red') {
      this.toggleMenu(!this.showMenu);
    }
  }
}

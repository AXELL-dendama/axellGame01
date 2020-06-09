import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class ResultsController extends Controller {
  @service game;

  get players() {
    const players = [...this.game.players];
    const sorted = [...this.game.players].sort((a, b) => a.points - b.points);
    const places = ['1st', '2nd', '3rd'];

    return players.map((player) => {
      const placeIndex = sorted.indexOf(player);
      return {
        place: placeIndex,
        placeLabel: places[placeIndex],
        name: player.name,
        points: player.points
      };
    });
  }

  sendGameResultsUpstream() {
    if (!('post_game_results' in window)) {
      return;
    }

    // @TODO retrieve results from game service
    const results = {};
    const json = {
      // results: results,
      // game_name: 'speed_trick_d',
      // game_settings: game_settings,
      // is_my_rating: results.is_my_rating,
      // Dgame: 'true',
      // dendaMile: results.dendaMile
    };

    const {
      post_game_results,
      common_loader,
      dendama_card_info,
      showDendaMileModal,
      modalFail_ajax
    } = window;

    common_loader(true);
    post_game_results(json)
      .done(function(res){
        console.log(res);
        for (let i in res){
          if(dendama_card_info[res[i].card_id]){
            dendama_card_info[res[i].card_id].Game = JSON.stringify(res[i].game_log);
          }
        }

        common_loader(false);
        //check for dendaMilePoints-------------------
        showDendaMileModal(res, results);
        //check for dendaMilePoints-------------------
      })
      .fail(function(e){
        console.log(e);
        common_loader(false);
        modalFail_ajax();
      });
  }
}


/*


//END OF GAME

var speed_trick_d_results = {
    time: {p1: 0},
    point: {p1: 0},
    difficulty: 'normal',
    trick: {p1: {}}, // 成功の技を格納していく
    participant: {}, // 参加者
    dendaMile: '10',
    is_my_rating: {} // 自分のレーティングでのゲームかどうか
  };

common_loader(true);
var post_game_json = {results: speed_trick_d_results, game_name: 'speed_trick_d', game_settings: game_settings, is_my_rating: speed_trick_d_results.is_my_rating, Dgame: 'true', dendaMile: speed_trick_d_results.dendaMile};
post_game_results(post_game_json)
.done(function(res){
  console.log(res);
  for(i in res){
    if(dendama_card_info[res[i].card_id]){
      dendama_card_info[res[i].card_id].Game = JSON.stringify(res[i].game_log);
    }
  }

  common_loader(false);
  //check for dendaMilePoints-------------------
  showDendaMileModal(res, speed_trick_d_results);
  //check for dendaMilePoints-------------------
})
.fail(function(e){
  console.log(e);

  common_loader(false);
  modalFail_ajax();
});

*/

import PubSub from 'pubsub-js';

export default function nativeTrick(device_id, sensing_trick, final_trick, series_trick, mid_series_trick, second_trick) {
  if (final_trick) {
      PubSub.publish('DENDAMA_TRICK', final_trick);
  }
}

if (window) {
  window.native_trick = nativeTrick;
}

/*
native_trick = function(device_id, sensing_trick, final_trick, series_trick, mid_series_trick, second_trick ){
  var participant = game_settings.participant;
  //make sure not work at the end of the game
  if(game_state != 'show_result'){
    for (i in dendama_uuid){
      if (dendama_uuid[i] == device_id){
        //参加者どうか確認
          if(participant[i] == true){
            //check if the player who did is the correct according to turn/round

            if(player_key[current_turn] == i){
              if(game_state == 'play'){
                if(sensing_trick != 'bigCup' && final_trick != 'bigCup' && sensing_trick != 'bigCupJump' && final_trick != 'bigCupJump'  && sensing_trick != 'baseCup' && final_trick != 'baseCup' && sensing_trick != 'baseCupJump' && final_trick != 'baseCupJump' && final_trick != 'pullupSpike')
                  {
*/

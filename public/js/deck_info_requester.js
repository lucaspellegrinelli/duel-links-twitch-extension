const api_url = "https://db.ygoprodeck.com/api/v5/cardinfo.php?name=";

function DeckInfoRequester(deck){
  this.deck = deck.get_unified_deck();
}

DeckInfoRequester.prototype.is_request_complete = function(){
  for(let i = 0; i < this.deck.length; i++){
    if(!("image" in this.deck[i])) return false;
  }

  return true;
}

DeckInfoRequester.prototype.request_callback = function(card, index, json, done_callback){
  this.deck[index].image = json[0]["card_images"][0]["image_url"];
  this.deck[index].type = json[0]["type"];
  this.deck[index].desc = json[0]["desc"];
  this.deck[index].attack = json[0]["atk"];
  this.deck[index].defense = json[0]["def"];
  this.deck[index].level = json[0]["level"];
  this.deck[index].type = json[0]["race"];
  this.deck[index].attribute = json[0]["attribute"];

  if(this.is_request_complete()){
    done_callback(this.deck);
  }
}

DeckInfoRequester.prototype.request_info = function(done_callback, fail_callback){
  let ctx = this;
  this.deck.forEach(function(card, index){
    let card_name = capitalize(card.name);
    let request_url = api_url + encodeURI(card_name);
    $.getJSON(request_url, function(){ })
      .done(function(json){
        ctx.request_callback(card, index, json, done_callback);
      })
      .fail(function(){
        fail_callback(card);
      });
  });
}

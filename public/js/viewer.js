let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

var requests = {
  get: create_request('GET', 'query', "", update_deck)
};

function reset_deck(){
  $("#deck-display").html('<p class="deck-title">MAIN DECK</p>');
  $("#extra-deck-display").html('<p class="extra-deck-title">EXTRA DECK</p>');
}

function update_deck(deck_json){
  reset_deck();
  let deck = Deck.from_json(deck_json);
  let deck_info_req = new DeckInfoRequester(deck);
  deck_info_req.request_info(update_deck_doms);
}

function update_deck_doms(unified_deck){
  const cards_in_row = 8;
  let main_deck_size = 0;
  let extra_deck_size = 0;

  unified_deck.forEach(function(card){
    if(card.main) main_deck_size += card.amount;
    else extra_deck_size += card.amount;
  });

  for(let i = 0; i < Math.ceil(main_deck_size / cards_in_row); i++){
    $('<div class="card-row">').appendTo("#deck-display");
  }

  if(extra_deck_size > 0){
    $('<div class="card-row">').appendTo("#extra-deck-display");
  }

  let card_index = 0;
  unified_deck.forEach(function(element, index, array){
    for(let i = 0; i < element.amount; i++){
      let img_dom = $("<div>", { class: "card-dropdown" });

      let image = $("<img>", { class: "card-img", src: element.image });
      image.appendTo(img_dom);

      let dropdown = $("<div>", { class: "card-content" });
      dropdown.html(element.name);
      dropdown.appendTo(img_dom);

      let target_row = Math.floor(card_index / cards_in_row);
      if(element.main) img_dom.appendTo($("#deck-display").children(".card-row").eq(target_row));
      else img_dom.appendTo($("#extra-deck-display").children(".card-row").eq(0));
      card_index++;
    }
  });
}

twitch.onContext((context) => { });

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;

  $('#set-deck').removeAttr('disabled');

  set_auth(token);
  $.ajax(requests.get);
});

$(function() {
  twitch.listen('broadcast', function (target, content_type, deck) {
    update_deck(deck);
  });
});

let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

var requests = {
  get: create_request('GET', 'query', "", update_deck)
};

function update_deck(deck_json){
  let deck = Deck.from_json(deck_json);
  let deck_info_req = new DeckInfoRequester(deck);
  deck_info_req.request_info(update_deck_doms);
}

function update_deck_doms(unified_deck){
  const cards_in_row = 8;
  let main_deck_size = 0;
  let extra_deck_size = 0;

  unified_deck.forEach(function(card){
    if(card.main) main_deck_size++;
    else extra_deck_size++;
  });

  for(var i = 0; i < Math.ceil(main_deck_size / cards_in_row); i++){
    $('<div class="card-row" id="card-row' + i + '">').appendTo("#deck-display");
  }

  if(extra_deck_size > 0){
    $('<div class="card-row" id="extra-card-row">').appendTo("#extra-deck-display");
  }

  let card_index = 0;
  unified_deck.forEach(function(element, index, array){
    for(let i = 0; i < element.amount; i++){
      let img_dom = $("<div>", {class: "card-dropdown"});
      img_dom.append(
        $("<img>", {
          id: "card" + card_index,
          class: "card-img",
          src: element.image
        })
      )

      img_dom.append(
        $("div", {
          class: "card-content",
          html: element.name
        })
      )

      if(element.main) img_dom.appendTo("#card-row" + Math.floor(card_index / cards_in_row));
      else img_dom.appendTo("#extra-card-row");
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

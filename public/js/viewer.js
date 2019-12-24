let token = '';
let tuid = '';

const twitch = window.Twitch.ext;

var requests = {
  get: create_request('GET', 'query', "", update_deck)
};

function update_deck(deck_json){
  let deck = Deck.from_json(deck_json);

  const cards_in_row = 8;
  var main_deck_size = deck.main.length;
  var extra_deck_size = deck.extra.length;

  for(var i = 0; i < Math.ceil(main_deck_size / cards_in_row); i++){
    var row_dom = $('<div class="card-row" id="card-row' + i + '">');
    row_dom.appendTo("#deck-display");
  }

  if(extra_deck_size > 0){
    var extra_row_dom = $('<div class="card-row" id="extra-card-row">');
    extra_row_dom.appendTo("#extra-deck-display");
  }

  var card_index = 0;
  var extra_card_index = 0;
  deck.get_unified_deck().forEach(function(element, index, array){
    var card_info_url = 'https://db.ygoprodeck.com/api/v5/cardinfo.php?name=' + encodeURI(element["name"]);
    var card_name = capitalize(element["name"]);
    $.getJSON(card_info_url, function(json) {
      for(var a = 0; a < element["amount"]; a++){
        var img_link = json[0]["card_images"][0]["image_url"];
        var img_dom = $('<div class="card-dropdown"><img id="card' + card_index + '" class="card-img" src="' + img_link + '"/><div class="card-content">' + card_name + '</div></div>');
        if(element["main"]){
          img_dom.appendTo("#card-row" + Math.floor(card_index / cards_in_row));
          card_index++;
        }else{
          img_dom.appendTo("#extra-card-row");
          extra_card_index++;
        }
      }
    });
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

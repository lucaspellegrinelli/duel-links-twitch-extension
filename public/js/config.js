let token, userId;

const twitch = window.Twitch.ext;

let main_item_count = 0;
let extra_item_count = 0;

var requests = { };

let dom_info = {
  "item": {"main": "main-item", "extra": "extra-item"},
  "name": {"main": "main-name", "extra": "extra-name"},
  "amount": {"main": "main-amount", "extra": "extra-amount"},
  "list": {"main": "main-deck-list", "extra": "extra-deck-list"},
  "count": {"main": 0, "extra": 0}
}

function update_card_items(which_deck){
  for(let id = 0; id < dom_info["count"][which_deck]; id++){
    let val_name = $("#" + dom_info["name"][which_deck] + id).val();
    if(val_name.length == 0){
      remove_card_item(id, which_deck);
      id = 0;
    }
  }

  add_card_item(which_deck);
}

function add_card_item(which_deck, bypass_test=false){
  if(!bypass_test){
    for(let id = 0; id < dom_info["count"][which_deck]; id++){
      let val_name = $("#" + dom_info["name"][which_deck] + id).val();
      if(val_name.length == 0) return;
    }
  }

  let html = '<div class="row" id="' + dom_info["item"][which_deck] + dom_info["count"][which_deck] + '"><div class="three columns"><input class="u-full-width" type="number" min="1" max="3" value="3" id="' + dom_info["amount"][which_deck] + dom_info["count"][which_deck] + '"></div><div class="nine columns"><input class="u-full-width" type="text" placeholder="Card Name" id="' + dom_info["name"][which_deck] + dom_info["count"][which_deck] + '"></div></div>';

  dom_info["count"][which_deck]++;

  $(html).focusout(function(){
    update_card_items(which_deck);
  }).appendTo("#" + dom_info["list"][which_deck]);
}

function remove_card_item(index, which_deck){
  $("#" + dom_info["item"][which_deck] + index).remove();

  for(let id = index; id < dom_info["count"][which_deck]; id++){
    $("#" + dom_info["item"][which_deck] + id).attr("id", dom_info["item"][which_deck] + (id - 1));
    $("#" + dom_info["amount"][which_deck] + id).attr("id", dom_info["amount"][which_deck] + (id - 1));
    $("#" + dom_info["name"][which_deck] + id).attr("id", dom_info["name"][which_deck] + (id - 1));
  }

  dom_info["count"][which_deck]--;
}

function clear_card_items(which_deck){
  for(let id = 0; id < dom_info["count"][which_deck]; id++){
    $("#" + dom_info["item"][which_deck] + id).remove();
  }

  dom_info["count"][which_deck] = 0;
  add_card_item(which_deck);
}

function update_requests(){
  let deck = new Deck();
  for(let id = 0; id < dom_info["count"]["main"]; id++){
    if($("#" + dom_info["name"]["main"] + id).val().length > 0){
      deck.main.push({
        "name": $("#" + dom_info["name"]["main"] + id).val(),
        "amount": parseInt($("#" + dom_info["amount"]["main"] + id).val()),
      });
    }
  }

  for(let id = 0; id < dom_info["count"]["extra"]; id++){
    if($("#" + dom_info["name"]["extra"] + id).val().length > 0){
      deck.extra.push({
        "name": $("#" + dom_info["name"]["extra"] + id).val(),
        "amount": parseInt($("#" + dom_info["amount"]["extra"] + id).val()),
      });
    }
  }

  let encoded_deck = '?deck=' + encodeURI(deck.to_json());

  requests = {
    set: create_request('POST', 'submit', encoded_deck, update_deck_text),
    get: create_request('GET', 'query', "", update_deck_text)
  };

  set_auth(token);
}

function update_deck_text(deck_json) {
  let deck = Deck.from_json(deck_json);

  for(let i = 0; i < deck.main.length; i++) add_card_item("main", true);
  for(let i = 0; i < deck.extra.length; i++) add_card_item("extra", true);

  for(let i = 0; i < deck.main.length; i++){
    $("#" + dom_info["name"]["main"] + i).val(deck.main[i].name);
    $("#" + dom_info["amount"]["main"] + i).val(deck.main[i].amount);
  }

  for(let i = 0; i < deck.extra.length; i++){
    $("#" + dom_info["name"]["extra"] + i).val(deck.extra[i].name);
    $("#" + dom_info["amount"]["extra"] + i).val(deck.extra[i].amount);
  }

  update_card_items("main");
  update_card_items("extra");
}

twitch.onContext((context) => { });

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;

  $('#set-deck').removeAttr('disabled');

  update_requests();
  $.ajax(requests.get);
});

$(function(){
  add_card_item("main");
  add_card_item("extra");

  $("#clear-deck").click(function(){
    clear_card_items("main");
    clear_card_items("extra");
  });

  $("#set-deck").click(function(){
    if(!token) return twitch.rig.log('Not authorized');
    update_requests();
    $.ajax(requests.set);
  });
});

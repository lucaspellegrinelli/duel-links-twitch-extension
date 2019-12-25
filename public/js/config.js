let token, userId;

const twitch = window.Twitch.ext;

let target_dom = {
  "main": "#main-deck-list",
  "extra": "#extra-deck-list"
}

var requests = { };

function update_card_items(which_deck){
  $(target_dom[which_deck]).children().each(function(){
    let text_val = $(this).find("input[type='text']");
    if(text_val.length > 0 && text_val.val().length == 0){
      $(this).remove();
    }
  });

  add_card_item(which_deck);
}

function add_card_item(which_deck, name="", amount=3){
  let html = '<li><div class="row card-item"><div style="margin-right:3%;" class="one columns"><img src="icons/baseline_unfold_more_black_18dp.png"/></div><div class="three columns"><input class="u-full-width" type="number" value="' + amount + '"></div><div class="seven columns"><input class="u-full-width" type="text" value="' + name + '" placeholder="Card Name"></div></div></li>';
  $(html).focusout(function(){
    update_card_items(which_deck);
  }).appendTo(target_dom[which_deck]);
}

function clear_card_items(which_deck){
  $(target_dom[which_deck]).children().each(function(){
    $(this).remove();
  });

  add_card_item(which_deck);
}

function update_requests(){
  let deck = new Deck();

  $(target_dom["main"]).children().each(function(){
    let name_val = $(this).find("input[type='text']").val();
    let amt_val = $(this).find("input[type='number']").val();
    if(name_val.length > 0){
      deck.main.push({
        "name": name_val,
        "amount": parseInt(amt_val),
      });
    }
  });

  $(target_dom["extra"]).children().each(function(){
    let name_val = $(this).find("input[type='text']").val();
    let amt_val = $(this).find("input[type='number']").val();
    if(name_val.length > 0){
      deck.extra.push({
        "name": name_val,
        "amount": parseInt(amt_val),
      });
    }
  });

  let encoded_deck = '?deck=' + encodeURI(deck.to_json());

  requests = {
    set: create_request('POST', 'submit', encoded_deck, update_deck_text),
    get: create_request('GET', 'query', "", update_deck_text)
  };

  set_auth(token);
}

function update_deck_text(deck_json) {
  let deck = Deck.from_json(deck_json);

  clear_card_items("main");
  clear_card_items("extra");

  deck.main.forEach(function(card){
    add_card_item("main", card.name, card.amount);
  });

  deck.extra.forEach(function(card){
    add_card_item("extra", card.name, card.amount);
  });

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
  $("#main-deck-list").sortable();
  $("#main-deck-list").disableSelection();
  $("#extra-deck-list").sortable();
  $("#extra-deck-list").disableSelection();

  update_card_items("main");
  update_card_items("extra");

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

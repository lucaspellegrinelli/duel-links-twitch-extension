let token, userId;

const twitch = window.Twitch.ext;

let target_dom = {
  "main": "#main-deck-list",
  "extra": "#extra-deck-list"
}

var requests = {
  get: create_request('GET', 'query', "", update_deck_text)
};

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
  let html = '<li><div class="row card-item"><div style="margin-right:3%;" class="one columns"><img src="icons/baseline_unfold_more_white_18dp.png"/></div><div class="three columns"><input class="u-full-width" type="number" value="' + amount + '"></div><div class="seven columns"><input class="u-full-width" type="text" value="' + name + '" placeholder="Card Name"></div></div></li>';
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

  let deck_info_req = new DeckInfoRequester(deck);
  deck_info_req.request_info(function(unified_deck){
    send_deck_request(deck);
    enable_set_button();
    show_success_label();
  },
  function(failed_card){
    enable_set_button();
    show_failed_label(failed_card);
  });
}

function send_deck_request(deck){
  let encoded_deck = '?deck=' + encodeURI(deck.to_json());

  requests = {
    set: create_request('POST', 'submit', encoded_deck, update_deck_text),
    get: create_request('GET', 'query', "", update_deck_text)
  };

  set_auth(token);
  $.ajax(requests.set);
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

function show_success_label(){
  $("#feedback-message").html("Success");
  $("#feedback-message").css("display", "block");
  $("#feedback-message").css("background-color", "#2ecc71");
  setTimeout(function(){
    $("#feedback-message").css("display", "none");
  }, 7500);
}

function show_failed_label(card){
  $("#feedback-message").html("Couldn't find \"" + card.name + "\"");
  $("#feedback-message").css("display", "block");
  $("#feedback-message").css("background-color", "#e74c3c");
  setTimeout(function(){
    $("#feedback-message").css("display", "none");
  }, 7500);
}

function disable_set_button(){
  $('#set-deck').attr("class", "u-full-width")
  $('#set-deck').attr('disabled', 'disabled');
}

function enable_set_button(){
  $('#set-deck').attr("class", "u-full-width button-primary")
  $('#set-deck').removeAttr('disabled');
}

twitch.onContext((context) => { });

twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
  enable_set_button();
  set_auth(token);
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
    disable_set_button();
    update_requests();
  });
});

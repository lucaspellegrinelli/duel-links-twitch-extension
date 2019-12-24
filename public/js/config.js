let token, userId;

const twitch = window.Twitch.ext;

var requests = { };

function update_requests(){
  let deck = Deck.from_plain_text($("#deck-text").val());
  let encoded_deck = '?deck=' + encodeURI(deck.to_json());

  requests = {
    set: create_request('POST', 'submit', encoded_deck, update_deck_text),
    get: create_request('GET', 'query', "", update_deck_text)
  };

  set_auth(token);
}

function update_deck_text(deck_json) {
  let deck = Deck.from_json(deck_json);
  $('#deck-text').val(deck.to_plain_text());
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
  $("#set-deck").click(function(){
    if(!token) return twitch.rig.log('Not authorized');
    update_requests();
    $.ajax(requests.set);
  });

  twitch.listen('broadcast', function (target, contentType, deck) {
    update_deck_text(deck);
  });
});

function set_auth(token) {
  Object.keys(requests).forEach((req) => {
    requests[req].headers = { 'Authorization': 'Bearer ' + token }
  });
}

function create_request(type, method, options, success) {
  console.log('https://duel-links-twitch-extension.herokuapp.com/deck/' + method + options);
  return {
    type: type,
    url: 'https://duel-links-twitch-extension.herokuapp.com/deck/' + method + options,
    success: success,
    error: log_error
  }
}

function log_error(_, error, status) {
  twitch.rig.log('EBS request returned ' + status + ' (' + error + ')');
}

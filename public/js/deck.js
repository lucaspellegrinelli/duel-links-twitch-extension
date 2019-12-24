function Deck(){
  this.main = [];
  this.extra = [];
}

Deck.from_plain_text = function(text){
  let deck = new Deck();
  deck.from_plain_text(text);
  return deck;
}

Deck.from_json = function(json){
  let deck = new Deck();
  deck.from_json(json);
  return deck;
}

Deck.prototype.reset_decks = function(){
  this.main = [];
  this.extra = [];
};

Deck.prototype.from_json = function(json_txt){
  this.reset_decks();

  if(json_txt.includes("deck=")){
    json_txt = json_txt.split("deck=")[1];
  }

  let json_parsed = JSON.parse(json_txt);

  let ctx = this;
  json_parsed.forEach(function(element, index, array){
    if(element.main) ctx.main.push({"name": element.name, "amount": element.amount});
    else ctx.extra.push({"name": element.name, "amount": element.amount});
  });
};

Deck.prototype.from_plain_text = function(deck_txt){
  this.reset_decks();

  if(deck_txt == undefined || deck_txt.length == 0) return;
  deck_txt = deck_txt.toLowerCase();
  if(!deck_txt.includes('extra')) deck_txt += "\nextra\n"

  deck_lines = deck_txt.split("main")[1].split("extra")[0].split("\n").slice(1, -1);
  extra_lines = deck_txt.split("extra")[1].split("\n").slice(1);

  let ctx = this;
  deck_lines.forEach(function(line){
    if(line.replace("/^\s*[\r\n]/gm", "").length > 0){
      ctx.main.push({
        "name": line.substring(2), "amount": parseInt(line.charAt(0))
      });
    }
  });

  extra_lines.forEach(function(line){
    if(line.replace("/^\s*[\r\n]/gm", "").length > 0){
      ctx.extra.push({
        "name": line.substring(2), "amount": parseInt(line.charAt(0))
      });
    }
  });
};

Deck.prototype.get_unified_deck = function(){
  let unified_deck = []

  this.main.forEach(function(element, index, array){
    unified_deck.push({"name": element.name, "amount": element.amount, "main": true});
  });

  this.extra.forEach(function(element, index, array){
    unified_deck.push({"name": element.name, "amount": element.amount, "main": false});
  });

  return unified_deck;
};

Deck.prototype.to_plain_text = function(){
  var plain_text = "Main";

  this.main.forEach(function(element, index, array){
    plain_text += "\n" + element.amount + " " + capitalize(element.name);
  });

  plain_text += "\n";
  plain_text += "Extra";

  this.extra.forEach(function(element, index, array){
    plain_text += "\n" + element.amount + " " + capitalize(element.name);
  });

  plain_text += "\n";
  return plain_text;
};

Deck.prototype.to_json = function(){
  return JSON.stringify(this.get_unified_deck());
};

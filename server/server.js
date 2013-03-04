if (Meteor.isServer) {
  Meteor.startup(function () {
    
  });
}

Meteor.methods({
  checkPrice: function() {
    this.unblock();
    var msg = "msg";
    console.log('Getting site HTML... (shop.nordstrom.com)');
    var res = Meteor.http.get("http://shop.nordstrom.com/S/john-w-nordstrom-deerskin-driving-gloves/3285829?origin=keywordsearch&contextualcategoryid=0&fashionColor=&resultback=0");
    
    if (res.statusCode == 200) {
      var require = __meteor_bootstrap__.require
      var cheerio = require('/home/ubuntu/Dev/pricechecker/public/node_modules/cheerio')
      var $ = cheerio.load(res.content);
      
      var $el = $('#unavailableStyleMessage');
      
      if ($el.length)
        msg = $el.text();
    }
    else 
      msg = "Error - status code: " + res.statusCode;
    
    return msg;
  },
  postToPushover: function(item, msg) {
    var params = {
      token: 'TipIDO3oSeRtjcGUPlYl55inNMyRQ2',
      user: 'XvTsIbQacJaYcuYiCwaAw4fAvgooG0',
      message: "New update for " + item + ": " + msg,
      url: 'http://cwdev.mooo.com:3000',
      url_title: 'View Update'
    };
    
    console.log('Calling pushover api...');
    var result = Meteor.http.post('https://api.pushover.net/1/messages.json', { params: params });
    console.log(result.data);
    
    if (result.statusCode == 200)
      return "Pushover notification sent.";
    else
      return "Error sending pushover notification.";
  }
});
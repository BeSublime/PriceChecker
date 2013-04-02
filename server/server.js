if (Meteor.isServer) {
  Meteor.methods({
    addValue: function  (item, value) {
      //TODO: add better validation here
      if (typeof item !== "undefined" && typeof value !== "undefined") {
      Items.update(item,
                       {$push: 
                              {values: {value: value, date: EJSON.toJSONValue(new Date())}
                                      //$each: [{value: $el.text(), date: new Date()}],
                                      //$sort: { date: 1 }
                              }
                        });
      }
      else
        throw new Meteor.Error(400, "Required parameter missing");
    },
    updateValue: function(item) {
      console.log('updateValue invoked ' + item.url + ' ' + item.selector);
      if (typeof item.url !== "string" && item.url.length
          && typeof item.selector !== "string" && item.selector.length)
        throw new Meteor.Error(400, "Required parameter missing");
        
      this.unblock();
      console.log('Getting URL: ' + item.url);
      var res = Meteor.http.get(item.url);
      var result = { statusCode: res.statusCode };
      
      if (res.statusCode == 200) {
        var require = __meteor_bootstrap__.require
        var cheerio = require('/home/ubuntu/Dev/pricechecker/public/node_modules/cheerio') // FIXME: This needs to be done differently. This was the quick & dirty option.
        var $ = cheerio.load(res.content, { onerror: function(err) { console.log(err); } });
        
        //console.log('Content of page loaded for parsing:\n\n' + res.content);
        
        var $el = $(item.selector);
        
        if ($el.length) {
          result.value = $el.text();
          result.html = $.html();
          console.log('Updating value of item')
          Items.update(item,
                       {$push: 
                              {values: {value: $el.text(), date: EJSON.toJSONValue(new Date())}
                                      //$each: [{value: $el.text(), date: new Date()}],
                                      //$sort: { date: 1 }
                              }
                        });
        }
        else {
          result.error = "Error - element not found."; // FIXME: Technically this might not be an error - could mean product is back in stock
          result.html = $.html();
//          console.log('Updating value of item (value not found)');
//          Items.update(item,
//                       {$push: 
//                              {values: {value: undefined, date: EJSON.toJSONValue(new Date())}
//                                      //$each: [{value: $el.text(), date: new Date()}],
//                                      //$sort: { date: 1 }
//                              }
//                        });
        }
      }
      else 
        result.error = "Error - status code: " + res.statusCode; // FIXME: Use Meteor error?
      
      return result;
    },
    postToPushover: function(item, msg) {
      var params = {
        token: Meteor.settings.apis.pushover.token,
        user: Meteor.settings.apis.pushover.user,
        message: "New update for " + item + ": " + msg,
        url: 'http://cwdev.mooo.com:3000',
        url_title: 'View Item'
      };
      
      console.log('Calling pushover api...');
      var result = Meteor.http.post('https://api.pushover.net/1/messages.json', { params: params });
      console.log(result.data);
      
      if (result.statusCode == 200 && result.data.status == 1)
        console.log("Pushover notification sent.");
      else
        console.log("Error sending pushover notification. HTTP status code: " + result.statusCode + ", Pushover status code: " + result.data.status);
    }
  });
}
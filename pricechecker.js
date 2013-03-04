if (Meteor.isClient) {
  Meteor.startup(function () {
    //Meteor.call("checkPrice", function(err, msg) { Session.set("msg", msg) });
  });
  
  Template.main.value = function () {
    return Session.get("msg") || "no msg yet";
  };

  Template.main.events({
    'click input' : function () {
      Meteor.call("checkPrice", function(err, msg) { 
        Session.set("msg", msg);
        // post to pushover
        console.log('posting to pushover...');
        Meteor.call("postToPushover", "Deerskin Gloves", msg, function() { /* do nothing for now */ });
      });
    }
  });
}
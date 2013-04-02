if (Meteor.isClient) {
  Meteor.startup(function () {
    Session.set("showDetails", undefined);
    Session.set("notification", undefined);
  });
  
  var xhr = new XMLHttpRequest();
  	xhr.onreadystatechange = function() {
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					var link = document.getElementById('bookmarklet');
					link.href = "javascript:"+xhr.responseText;
					link.className = 'loaded';
				}
			}
		};
		xhr.open('get', 'superselector.js', true);
		xhr.send(null);
  
  Template.main.notification = function () {
    return Session.get("notification"); // TODO: Add setTimeout for closing alerts that have timeouts
  };
  Template.main.siteUrl = function  () {
    return Meteor.absoluteUrl('', { rootUrl: "http://cwdev.mooo.com:3000" });
  };
  
  Template.main.items = function () {
    return Items.find({ dateDeleted: null });
  };
  Template.main.lastDate = function () {
    // TODO: put logic here for "Today at ##:##pm"/"Yesterday at ##.." etc.
    return this.values ? EJSON.fromJSONValue(this.values[this.values.length - 1].date).format('m/dd/yy "at" h:MM:ss TT Z') : null;
  };
  Template.main.lastValue = function () {
    // TODO: put logic here for "Today at ##:##pm"/"Yesterday at ##.." etc.
    return this.values ? this.values[this.values.length - 1].value : null;
  };
  Template.main.showDetails = function() {
    return this._id == Session.get("showDetails");
  };
  Template.main.recentValues = function() {
    return _.last(this.values, 6);
  };
  Template.main.date = function() {
    return EJSON.fromJSONValue(this.date).format('m/dd/yy "at" h:MM:ss TT Z');
  };

  Template.main.events({
    'click input.checkvalue': function () {
      var item = this;
      console.log("calling updateValue...");
      Meteor.call("updateValue", this, function(err, result) {
        if (typeof err === "undefined") {
          if (typeof result.error !== "undefined") {
            // try with jQuery first
            if (result.html) {
              console.log('Server-side scrape failed, trying client-side...');
              var value = $(item.selector, result.html);
              if (value.length) {
                value = value.text();
                console.log('addValue running...');
                Meteor.call('addValue', item, value);
              }
              //FIXME: For somereason jquery tries to grab the images from result.html... fix this.
            }
          }
          else {
            Session.set('notification', { type: 'success', content: 'Item updated.', timeout: 4 * 1000 });
          }
        }
      });
      return false;
    },
    'click tr.item': function (event, template) {
      if (this.values) {
        $(event.currentTarget).toggleClass('selected');
        
        Session.set("showDetails", $(event.currentTarget).is('.selected') ? this._id : undefined);
      }
    },
    'click #submit': function (event, template) {
      var name = template.find("#name").value;
      var selector = template.find("#selector").value;
      var url = template.find("#url").value;
      
      if (name.length && selector.length && url.length) {
        console.log('calling addItem...');
        Meteor.call("addItem",
                    { name: name, selector: selector, url: url },
                    function (error, itemId) {
                      Session.set("notification", { type: "success", content: 'Item added.' });
                    });
      }
      else {
        // TODO: validation needed
      }
    },
    'click i.remove': function (event, template) {
      if (Items.findOne(this)) {
        console.log('Removing item ' + this);
        Meteor.call("removeItem", this, function(error, item) {
          if (!error) {
            Session.set('undoObject', { type: 'item', action: 'remove', value: item._id });
            Session.set("notification", { type: "warning", content: 'Item removed.', undo: true });
          }
          else {
            Session.set("notification", { type: "error", content: 'Error removing item.' });
            console.log(error);
          }
        });
      }
      return false;
    },
    'click .undo': function   (event, template) {
      var undo = Session.get('undoObject');
      console.log('Undoing... ', undo);
      if (undo && undo.type == 'item' && undo.action == 'remove' && undo.value) {
        try {
          Items.update(undo.value, {$set: {dateDeleted: null}})
          Session.set("notification", { type: "success", content: 'Item restored.' });
        }
        catch (err) { }
      }
      return false;
    },
    'click .alert .close': function  () {
      Session.set('notification', undefined);
      return false;
    }
  });
}
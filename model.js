// PriceChecker (working title) -- data models
// Loaded on both the client and the server

///////////////////////////////////////////////////////////////////////////////
// Items

/*
  Each item is represented by a document in the Items collection:
    name,
    description (unused),
    url,
    selector: String
    values: Array of objects like { date: Date, value: "$14.99" } (or "Out of Stock"/"Not Available")
*/
Items = new Meteor.Collection("items");

Items.allow({
  insert: function (name, selector, value) {
    return false; // no bueno -- use addItem method
  },
  update: function (item) {
    // A good improvement would be to validate the type of the new
    // value of the field (and if a string, the length.) In the
    // future Meteor will have a schema system to makes that easier.
    return true;
  },
  remove: function (item) {
    return true;
  }
});

Meteor.methods({
  addItem: function(options) {
    options = options || {};
    // everything legit?
    //if (typeof options.value !== "string" && options.value.length) {
      // try to get the value
      // do i need to? this should always be passed in... have the client check for it before adding the item...
    //}
    if (!(typeof options.name === "string" && options.name.length &&
          typeof options.selector === "string" && options.selector.length &&
          typeof options.url === "string" && options.url.length))
      throw new Meteor.Error(400, "Required parameter missing");
    if (options.name.length > 100)
      throw new Meteor.Error(413, "Title too long");
    
    var newItem = Items.insert({
      name: options.name,
      //description: options.description || null,
      selector: options.selector,
      url: options.url,
      dateAdded: new Date() //EJSON.toJSONValue(new Date())
    });
    
    if (options.value) {
      return Items.update(newItem,
                          {$push:
                             {values: 
                                {value: options.value, date: EJSON.toJSONValue(new Date())}
                             }
                          });
    }
    else
      return newItem;
  },
  removeItem: function  (item) {
    try {
      Items.update(item, {$set: {dateDeleted: new Date()}}); //FIXME: This should use EJSON.toJSONvalue, but it's not working for some reason.
    }
    catch (err) {
      throw new Meteor.Error(501, "Error removing item.", err);
    }
    
    return item;
  }
});
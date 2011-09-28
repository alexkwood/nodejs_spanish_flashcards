/* simple mongodb handler for Flashcards
   put in /controllers dir, quasi-MVC
*/

// @todo how to make this global?? already loaded in app.js.
var _ = require('underscore')._;

FlashcardHandler = function() {
  mongodb = require("mongodb");
  
  this.mongo = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, { auto_reconnect:true });
  this.db = new mongodb.Db('flashcards', this.mongo, { native_parser:false, strict:true }); // crashes w/ strict off!
  this.db.open(function(){}); //?
};

FlashcardHandler.prototype.getCollection = function(collectionName, callback) {
  var db = this.db;   // otherwise gets lost ... figure out why!
  db.collection(collectionName, function(error, collection) {
    if (error) {
      // don't fail just yet -- try to CREATE the collection in case it doesn't exist.
      db.createCollection(collectionName, function(error, collection){
        if (error) callback(error);
        else callback(null, collection);
      });      
    }
    else callback(null, collection);
  });
};

FlashcardHandler.prototype.findAll = function(collectionName, callback) {
    this.getCollection(collectionName, function(error, collection) {
      if (error) callback(error);
      else {
        collection.find(function(error, cursor) {
          if (error) callback(error);
          else {
            cursor.toArray(function(error, results) {
              if (error) callback(error);
              else callback(null, results);
            });
          }
        });
      }
    });
};

// 'word' is a modeled object
// callback() takes (error, results)
FlashcardHandler.prototype.addWord = function(word, callback) {
  var collection = this.getCollection('words', function(error, collection) {
    if (error) callback(error);
    else {
      collection.insert(word, function(error, docs) {
        if (error) callback(error);
        else callback(null, docs);
      });
    }
  });
};


FlashcardHandler.prototype.getRandom = function(collectionName, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.count(function(error, count) {
        if (error) callback(error);
        
        // skip a random number of records
        var skip = Math.floor( Math.random() * count );
        
        collection.find({}, { limit: 1, skip: skip }, function(error, cursor){
          if (error) callback(error);
          
          cursor.nextObject( function(error, doc){
            if (error) callback(error);
            
            console.log('doc:', doc);
            
            callback(null, doc);
          });
        });
      });
    }
  });
};


exports.FlashcardHandler = FlashcardHandler;
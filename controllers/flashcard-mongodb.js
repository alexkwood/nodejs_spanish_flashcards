/* simple mongodb handler for Flashcards
   put in /controllers dir, quasi-MVC
   add functions to prototype -- need to instantiate a controller to use.
   
   convention for 'callback' -- takes error (null on success) + results
   
   this is very generic ... is it necessary at all? shouldn't all this be part of the mongo module?
*/

var _ = require('underscore')._;
var mongodb = require("mongodb");   // better here or in constructor?
var BSON = require('mongodb').BSONPure;


// object constructor
FlashcardHandler = function() {
  this.mongo = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, { auto_reconnect:true });
  this.db = new mongodb.Db(global.dbName, this.mongo, { native_parser:false, strict:true }); // crashes w/ strict off!
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


// doc should be a modeled object
FlashcardHandler.prototype.save = function(collectionName, doc, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.insert(doc, function(error, docs) {
        if (error) callback(error);
        else callback(null, docs);
      });
    }
  });
};


FlashcardHandler.prototype.getById = function(collectionName, id, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {      
      collection.findOne({ _id: BSON.ObjectID(id) }, function(error, doc){
        if (error) callback(error);
        else {
          console.log('doc:', doc);
          callback(null, doc);
        }
      });
    }
  });
};



// get a random doc in a collection
FlashcardHandler.prototype.getRandom = function(collectionName, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.count(function(error, count) {
        if (error) callback(error);
        
        // skip a random number of records
        var skip = Math.floor( Math.random() * count );

        // impt: can't use findOne() w/ skip for some reason.
        collection.find({}, { limit: 1, skip: skip }, function(error, cursor){
          if (error) callback(error);
          
          cursor.nextObject( function(error, doc){
            if (error) callback(error);
            else {
              console.log('doc:', doc);            
              callback(null, doc);
            }
          });
        });
      });
    }
  });
};


FlashcardHandler.prototype.remove = function(collectionName, id, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.remove({ _id: BSON.ObjectID(id) }, function(error, result) {
        if (error) callback(error);
        callback(null, result);
      });
    }
  });
};


exports.FlashcardHandler = FlashcardHandler;
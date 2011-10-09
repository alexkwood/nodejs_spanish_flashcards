/* simple mongodb handler for Flashcards
   -- it's really a GENERIC mongo handler, which begs the question, 
      is it necessary at all? shouldn't all this be part of the mongo module?

   add functions to prototype -- need to instantiate a controller to use.
   
   convention for 'callback' -- takes error (null on success) + results
   
   @todo handle DB outage more gracefully. timeout on connection?   
*/

var _ = require('underscore')._;
var mongodb = require("mongodb");   // better here or in constructor?
var BSON = require('mongodb').BSONPure;


// constructor + export. (are all the intermediaries necessary?)
var MongoHandler = exports = module.exports = function(dbName) {
  this.mongo = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, { auto_reconnect:true });
  this.db = new mongodb.Db(dbName, this.mongo, { native_parser:false, strict:true }); // crashes w/ strict off!
  this.db.open(function(){}); //?
};


MongoHandler.prototype.getCollection = function(collectionName, callback) {
  var db = this.db;   // otherwise gets lost ... figure out why!
  db.collection(collectionName, function(error, collection) {
    if (error) {
      // don't fail just yet -- try to CREATE the collection in case it doesn't exist.
      db.createCollection(collectionName, function(error, collection){
        if (error) return callback(error);
        else callback(null, collection);
      });      
    }
    else callback(null, collection);
  });
};

MongoHandler.prototype.getAllDocuments = function(collectionName, callback) {
  this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {
      collection.find(function(error, cursor) {
        if (error) return callback(error);
        else {
          cursor.toArray(function(error, results) {
            if (error) return callback(error);
            else callback(null, results);
          });
        }
      });
    }
  });
};


// doc should be a modeled object
MongoHandler.prototype.save = function(collectionName, doc, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);

    collection.save(doc, {}, function(error, result) {
      console.log('collection.save:', error, result);
      if (error) return callback(error);
      
      // if save() results in update(), then 'result' will be null. assume success if no error. [??]
      if (_.isEmpty(result)) {
        result = doc;
        console.log('[save] assuming successful update()', result);
      }
      
      return callback(null, result);
    });
  });
};


MongoHandler.prototype.getById = function(collectionName, id, callback) {
  id = this.objectID(id);
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {      
      collection.findOne({ _id: id }, function(error, doc){
        if (error) return callback(error);
        else {
          console.log('doc:', doc);
          callback(null, doc);
        }
      });
    }
  });
};



// get a random doc in a collection
MongoHandler.prototype.getRandom = function(collectionName, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {
      collection.count(function(error, count) {
        if (error) return callback(error);
        
        // skip a random number of records
        var skip = Math.floor( Math.random() * count );

        // impt: can't use findOne() w/ skip for some reason.
        collection.find({}, { limit: 1, skip: skip }, function(error, cursor){
          if (error) return callback(error);
          
          cursor.nextObject( function(error, doc){
            if (error) return callback(error);
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


MongoHandler.prototype.remove = function(collectionName, id, callback) {
  id = this.objectID(id);
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {
      collection.remove({ _id: id }, function(error, result) {
        if (error) return callback(error);
        callback(null, result);
      });
    }
  });
};


// convert an ID string to an ObjectID
MongoHandler.prototype.objectID = function(id) {
  try {
    return BSON.ObjectID(id);
  }
  catch(e) {
    return id;
  }
};
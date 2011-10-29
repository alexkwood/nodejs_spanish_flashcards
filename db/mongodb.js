/* simple mongodb handler for Flashcards
   -- it's really a GENERIC mongo handler, which begs the question, 
      is it necessary at all? shouldn't all this be part of the mongo module?

   add functions to prototype -- need to instantiate a controller to use.
   
   convention for 'callback' -- takes error (null on success) + results
*/

var _ = require('underscore')._;
var mongodb = require("mongodb");   // better here or in constructor?
var BSON = require('mongodb').BSONPure;


// constructor + export. (are all the intermediaries necessary?)
var MongoHandler = exports = module.exports = function(dbName) {
  this.mongo = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, { auto_reconnect:true, native_parser:false });
  this.db = new mongodb.Db(dbName, this.mongo, { strict:false }); // was crashing w/ strict off... but session store assumes on!
};

// not sure if this makes sense. is open() even necessary?
// triggered in app.connectDb() middleware.
// connect-mongo sessions store uses same db connection but opens it separately...?
MongoHandler.prototype.open = function(callback) {
  // already opened? w/connect-mongo, seems to be.
  if (this.db.state == 'connected') {
    callback(null);
  }
  else {
    this.db.open(function(error, db){
      if (error) callback(error);
      else {
        callback(null);
      }
    });    
  }
};

MongoHandler.prototype.getCollection = function(collectionName, callback) {
  var db = this.db;   // otherwise gets lost ... figure out why!
  db.collection(collectionName, function(error, collection) {
    if (error) {
      // don't fail just yet -- try to CREATE the collection in case it doesn't exist.
      // [only necessary when strict mode is ON.]
      db.createCollection(collectionName, function(error, collection){
        if (error) return callback(error);
        else callback(null, collection);
      });      
    }
    else callback(null, collection);
  });
};

MongoHandler.prototype.getDocuments = function(collectionName, query, callback) {
  this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {
      collection.find(query, function(error, cursor) {
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
  // console.log('about to save doc:', doc);
  
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
  id = MongoHandler.objectID(id);
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {      
      collection.findOne({ _id: id }, function(error, doc){
        if (error) return callback(error);
        else {
          // console.log('doc:', doc);
          callback(null, doc);
        }
      });
    }
  });
};



// get a random doc in a collection
// filter by 'query' (pass {} for all)
// pass back the count along with a random doc
MongoHandler.prototype.getRandom = function(collectionName, query, callback) {
  // console.log("getRandom with query: ", query);  
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) return callback(error);
    else {
      collection.count(query, function(error, count) {
        // console.log("count result: ", count);
        
        if (error) return callback(error);
        
        // skip a random number of records
        var skip = Math.floor( Math.random() * count );

        // impt: can't use findOne() w/ skip for some reason.
        collection.find(query, { limit: 1, skip: skip }, function(error, cursor){
          if (error) return callback(error);
          
          cursor.nextObject( function(error, doc){
            if (error) return callback(error);
            else {
              // console.log('doc:', doc);            
              callback(null, doc, count);
            }
          });
        });
      });
    }
  });
};


MongoHandler.prototype.remove = function(collectionName, id, callback) {
  id = MongoHandler.objectID(id);
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


// convert an ID string to an ObjectID [STATIC]
MongoHandler.objectID = function(id) {
  try {
    return BSON.ObjectID(id);
  }
  catch(e) {
    return id;
  }
};


MongoHandler.prototype.distinct = function(collectionName, key, query, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else collection.distinct(key, query, callback);
  });
};

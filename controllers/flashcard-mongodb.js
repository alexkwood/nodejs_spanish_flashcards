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

// doc should be a modeled object
// callback() takes (error, results)
FlashcardHandler.prototype.save = function(collectionName, doc, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      
      // set max ID + 1
      // (count() isn't enough b/c deleting records causes dups)
      collection.count(function(error, count) {
        if (! error) {
          doc._id = count+1;
          console.log('set id: ' + doc._id + '\n');
        }   // otherwise leave default ObjectID        

        collection.insert(doc, function(error, docs) {
          if (error) callback(error);
          else callback(null, docs);
        });        
      });
    }
  });
};


// ATTEMPT TO USE SEQUENTIAL IDS, CAN'T GET IT TO WORK. GOING BACK TO HASH ID'S.
// get max _id + 1
// (count() isn't enough b/c deleting records causes dups)
/*FlashcardHandler.prototype.getNextId = function(collectionName, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.mapReduce(
        function map() {
          // console.log('map: ', this);
          emit(this._id);
        },
        function reduce (key, values) {
          // console.log('reduce: ', key, values);
          // console.log('reduced to:', reduced);
          return Math.max.apply(Math, values);
        },
        { 
          out: collectionName + '_ids',
          keeptemp: false,    // might as well make it permanent
          finalize: function fin(key, value) {
            // console.log('fin: ', key, value);
            return db.oplan.findOne({id:key, num:value});   // what is oplan??
          }  //,
          // limit: 1,
        }, 
        function(error, docs) {
          // console.log('reduce: ', docs);
          if (error) callback(error);
          else callback(null, docs);
        }
      );
    }
  });
};
*/

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

FlashcardHandler.prototype.remove = function(collectionName, id, callback) {
  var collection = this.getCollection(collectionName, function(error, collection) {
    if (error) callback(error);
    else {
      collection.remove({ _id: id }, function(error, result) {
        if (error) callback(error);
        
        callback(null, result);
      });
    }
  });
};


exports.FlashcardHandler = FlashcardHandler;
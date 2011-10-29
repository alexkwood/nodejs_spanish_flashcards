/* model for 'word' entities
   use the generic db model
*/

var _ = require('underscore')._;

var collectionName = 'words';     // where should this go?

// simple model for individual Words
var Word = exports = module.exports = function(word) {
  if (_.isEmpty(word)) word = {};
  
  // map properties of 'word' and fill missing values w/ defaults.
  _.extend(this, 
    {
      word_es: '',
      word_en: '',
      type: '',
      
      group: null,
      
      // should these be here, or only handled on save?
      created: null,    //new Date(),
      updated: null
    },
    word);
    
  // new group? (from form)
  if (!_.isUndefined(this.new_group)) {
    if (!_.isEmpty(this.new_group)) {
      this.group = this.new_group;      
    }
    delete this.new_group;
  }
  
  // console.log('modeled new word:', this);  
};


// make sure all the required pieces are in.
Word.prototype.validate = function(callback) {
  try {
    if (_.isEmpty(this.word_es)) return callback(new Error('Missing Spanish word.'));
    if (_.isEmpty(this.word_en)) return callback(new Error('Missing English word.'));
    // [type is optional]
  }
  catch(error) {    // if something else is wrong w/ object & can't check properties
    callback(error);    // good?
  }
  
  callback();
};


Word.prototype.save = function(db, callback) {
  console.log('saving word: ', this);
  
  // set a Created or Updated date.
  if (_.isUndefined(this.created)) {
    this.created = new Date;
    console.log('set created date to ', this.created);
  }
  else {
    this.updated = new Date;
    console.log('set updated date to ', this.updated);
  }
  
  db.save(collectionName, this, callback);
};


// get the friendly type of this word
Word.prototype.getWordType = function() {
  var types = exports.getWordTypes();     // in same file, does that work?
  if (!_.isEmpty(this.type) && !_.isUndefined(types[this.type])) {
    return types[this.type];
  }
  return this.type;
};


// @todo 'update' separate from 'save'?

// Word.prototype.XXX = function() {
// };


////////////////////////////////////////////

// word-related handlers not specific to an INDIVIDUAL word.

// @todo make all these functions MAP to model

// take an array of word objects from the DB or elsewhere, and map them to the model object.
// meant to be a helper function for other getters here that retrieve multiple words.
exports.mapWordsToModel = function(error, words, callback) {
  if (error) callback(error);
  else {
    words = _.map(words, function mapWordToModel(word) {
      return new Word(word);
    });
    callback(null, words);
  }
};

exports.getById = function(db, id, callback) {
  db.getById(collectionName, id, function(error, word) {
    if (error) callback(error);
    else callback(null, new Word(word));
  });
};

// callback takes and passes back word + count
exports.getRandom = function(db, query, callback) {
  db.getRandom(collectionName, query, function(error, word, count) {
    if (error) callback(error);
    else if (count === 0) {    // no words left
      callback(null, null, 0);
    }
    else {
      // console.log("random word:", word);
      callback(null, new Word(word), count);
    }
  });
};

exports.getWords = function(db, query, callback) {
  db.getDocuments(collectionName, query, function(error, words) {
    exports.mapWordsToModel(error, words, callback);
  });
};

// -- should this be part of Word object or separate export?
exports.remove = function(db, id, callback) {
  db.remove(collectionName, id, callback);
};


// word types, i.e. parts of speech
// used by getWordType() on word object.
exports.getWordTypes = function() {
  return {
    'n': 'noun',
    'v': 'verb',
    'adj': 'adjective',
    'adv': 'adverb',
    'pro': 'pronoun',
    'phrase' : 'phrase'
  };
};

// get the existing 'group' values
exports.getGroups = function(db, callback) {
  db.distinct(collectionName, 'group', {}, callback);
};

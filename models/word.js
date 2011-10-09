/* model for 'word' entities
   use the generic db model
*/

var _ = require('underscore')._;

var mongoHandler = require('../db/mongodb.js');
var db = new mongoHandler('flashcards');    // db name

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
      
      // should these be here, or only handled on save?
      created: null,    //new Date(),
      updated: null
    },
    word);
  
  // return word;
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


Word.prototype.save = function(callback) {
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
Word.prototype.getType = function() {
  var types = exports.getTypes();     // in same file, does that work?
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

exports.getById = function(id, callback) {
  db.getById(collectionName, id, function(error, word) {
    if (error) callback(error);
    else callback(null, new Word(word));
  });
};

exports.getRandom = function(callback) {
  db.getRandom(collectionName, function(error, word) {
    if (error) callback(error);
    else callback(null, new Word(word));
  });
};

exports.getAll = function(callback) {
  db.getAllDocuments(collectionName, function(error, words) {
    exports.mapWordsToModel(error, words, callback);
  });
};

// -- should this be part of Word object or separate export?
exports.remove = function(id, callback) {
  db.remove(collectionName, id, callback);
};


// word types, i.e. parts of speech
// used by getType() on word object.
exports.getTypes = function() {
  return {
    'n': 'noun',
    'v': 'verb',
    'adj': 'adjective',
    'adv': 'adverb',
    'pro': 'pronoun',
    'phrase' : 'phrase'
  };
};

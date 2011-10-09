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

////////////////////////////////////////////


/*
WordForm = function() {

  // load modules
  var forms = require('forms'),
  fields = forms.fields,
  widgets = forms.widgets,
  util = require('util');
  
  this.form = forms.create({
    word_es: fields.string({ label: 'Spanish', required: true }),
    word_en: fields.string({ label: 'English', required: true }),
    type: fields.string({ 
      label: 'Type', 
      widget: widgets.select(),
      choices: {
        '': '',
        'n': 'noun',
        'v': 'verb',
        'adv': 'adverb',
        'pro': 'pronoun'
      }
    }),
    _id: fields.string({ label: null, widget: widgets.hidden(), id: 'edit_id' })    
  });   // (this.form has property 'fields' which can be modified)


  // set defaults and render
  this.render = function(req, res, locals) {
    // clear the form on successful submit, to add another
    if (!_.isUndefined(locals.success)) {
      if (locals.success === true) {  // @todo consolidate?
        this.form.bind({});
        console.log('cleared form\n');
      }
    }
    
    // edit an existing word?
    var id = req.param('id');
    if (! _.isEmpty(id)) {
      this.form.bind( locals.edit );
      console.log('binding:', locals.edit);
      locals.pageTitle = 'Edit Word';
    }
    
    
    locals = _.extend({
        success: false,
        pageTitle: 'Add a Word',
        form: this.form.toHTML(),
        results: null
      },
      locals    // overrides
    );
    
    res.render('add', {
      locals: locals
    });

  };  //render
  
  
  // 'handle' the form -- render / validate / process
  // consolidated to handle GET/POST/new/edit all together
  this.handle = function(req, res, flashcardHandler) {    

    // keep ref
    // [can this be done w/ _.bind() instead?]
    wordForm = this;
    
    // if there's no form data, just render.
    // if (_.isEmpty(form.data))

    this.form.handle(req, {
      // form passed validation - save the word!
      success: function(form) {
        console.log('success! form data: ' + util.inspect(form.data) + '\n');

        console.log('form data:', form.data);

        var word = new Word(form.data);
        console.log('word to save:', word);
        
        // is this an EDIT?
        var id = req.param('id');
        if (! _.isEmpty(id)) {
          word._id = flashcardHandler.objectID(id);
          console.log('added ID to update:', word._id);
        }
      
        flashcardHandler.save(global.wordsCollection, word, function(error, result) {
          if (error) {
            // allow object or string
            var errorStr = error;
            if (! _.isString(errorStr)) errorStr = util.inspect(errorStr);
          
            errorStr = "Unable to save the word: " + errorStr;

            app.prettyError(errorStr, req, res);    //END.
          }
          else {
            console.log('saved new word:', result);
            
            // render page w/ results
            wordForm.form.bind({});
            wordForm.render(req, res, { 
              success:true,
              results: result.word_es + ' / ' + result.word_en
            });
          }
        });
      
      },
    
      // did not pass validation, re-render
      other: function(form) {
        wordForm.render(req, res, {});
      }
      
    }); // this.form.handle

  }; // this.handle  
  
};  //WordForm

exports.WordForm = WordForm;
*/
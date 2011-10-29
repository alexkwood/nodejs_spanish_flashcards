// routes: /word/*

/*
new url structure:
- /word/add
- /word/list
- /word/:word (view)
- /word/:word/edit
- /word/:word/delete
*/

// all DB handling goes thru model
var WordHandler = require('../models/word.js');     // don't use 'Word' name to avoid confusion
var util = require('util');
var _ = require('underscore')._;

// [was using, see comment below]
// var events = require("events"),
//     emitter = new events.EventEmitter;


// app passed as closure
module.exports = function(app){

  // load the groups & emit an event.
  var getGroups = function(db, currentWord, callback) {
    WordHandler.getGroups(db, function(error, groups) {
      if (error) {
        return callback(error);
      }

      groups = _.map(groups, function(value) {
        map = { key: value, value: value, selected: false };
        if (!_.isUndefined(currentWord.group)) {
          if (currentWord.group == value) map.selected = true;
        } 
        return map;
      });
      
      callback(null, groups);
    });
  };
  

  // process :word param when passed
  // [how does connectDb middleware work here?]
  app.param('word', /*app.restrictUser,*/ app.connectDb, function(req, res, next, id){
    WordHandler.getById(req.db, id, function(error, word) {
      if (error) {
        
        // @TODO THIS NEEDS TO HANDLE INVALID ID'S!!
        
        req.flash('error', util.inspect(error));    // [added]
        return next(error);      // what does this do?
      }
      
      req.word = new WordHandler(word);
      // console.log('matched word: ', req.word);
      
      next();     // continues to router?
    });
  });
  
  
  app.get('/word', /*app.restrictUser,*/ app.connectDb, function(req, res) {
    res.redirect('/word/list');
  });
  

  app.get('/word/list', /*app.restrictUser,*/ app.connectDb, function(req, res) {
    
    var query = {};
    var pageTitle = 'List';
    
    // filters?
    if (!_.isUndefined(req.query.group)) {
      query = { 'group': req.query.group };
      pageTitle = 'Words in group &quot;' + req.query.group + '&quot;';
    }
    
    WordHandler.getWords(req.db, query, function(error, words) {
      if (error) {
        req.flash('error', "Error: " + util.inspect(error));
        res.redirect('back');
      }
      else {
        // console.log('words:', words);
        
        res.render('word/list', {
          pageTitle: pageTitle,
          words: words,
          showWordLinks: true
        });
      }
    });
  });
  
  
  app.get('/word/add', app.restrictUser, app.connectDb, function(req, res) {
    var word = new WordHandler();   //empty
    
    // prepopulate from querystring? (used from /lookup results)
    if (!_.isUndefined(req.query.word_es) || !_.isUndefined(req.query.word_en)) {
      word = new WordHandler(req.query);
    }
    
    // get groups. was using EventEmitter here, but it kept throwing a "Can't use mutable header APIs after sent" error.
    getGroups(req.db, {}, function(error, groups){
      if (error) {
        req.flash('error', "Unable to get groups. " + util.inspect(error));
        res.render('home', { locals: { pageTitle : '' } });
        return;
      }
      
      res.render('word/form', {
        locals: {
          word: word,
          pageTitle: 'Add a Word',
          action: '/word',

          // for dropdown
          types: _.map(WordHandler.getWordTypes(), function(value, key) {
            return { 
              key: key, 
              value: value, 
              selected: _.isUndefined(req.query.type) ? false : (req.query.type == key)
            };
          }),
          
          groups: groups
        }
      });
    });
  });

  
  
  app.get('/word/:word/edit', app.restrictUser, app.connectDb, function(req, res) {
    
    getGroups(req.db, req.word, function(error, groups) {
      if (error) {
        req.flash('error', "Unable to get groups. " + util.inspect(error));
        res.render('home', { locals: { pageTitle : '' } });
        return;
      }
      
      res.render('word/form', {
        locals: {
          word: req.word,   // from app.param()
      
          action: '/word/' + req.word._id,
      
          pageTitle: 'Edit Word',
      
          // for dropdown
          types: _.map(WordHandler.getWordTypes(), function(value, key) {
            return { 
              key: key,
              value: value,
              selected: (req.word.type == key)
            };
          }),
          
          groups: groups
        }
      });
      
    });
  });
  

  // after all the fixed /word/X, assume X is an ID.
  app.get('/word/:word', /*app.restrictUser,*/ app.connectDb, function(req, res) {
    // 'list' view includes styles, 'word' is a partial.
    res.render('word/list', {
      locals: {
        words: [ req.word ],
        pageTitle: '',
        showWordLinks: true
      }
    });
  });
  
  
  // save a new or updated word (or return to form if validation failed.)
  // using POST for create & update; some use PUT, seems controversial/not that important.
  app.post('/word/:word?', app.restrictUser, app.connectDb, function(req, res) {
    // console.log('params:', req.body);

    // start w/ empty, or existing.
    if (_.isUndefined(req.word)) {
      var originalWord = new WordHandler();
    }
    else {
      var originalWord = req.word;
    }

    // pull new values from POST request (only partial).
    var updatedWord = req.body;
    
    // update/fill.
    updatedWord = _.extend(originalWord, updatedWord);
    console.log('original word:', originalWord);
    console.log('updated word:', updatedWord);
    
    // map to model. cleans up new_group, etc.
    updatedWord = new WordHandler(updatedWord);
    console.log('modeled word:', updatedWord);
    
    // save if validates.
    updatedWord.validate(function(error) {
      if (error) {
        req.flash('error', error.message);
        return res.redirect('back');
      }
      
      updatedWord.save(req.db, function(error){
        if (error) {
          console.log("Error on save: %j", error);
          return next(error);    // ??
        }

        req.flash('info', "Successfully updated word '" + updatedWord.word_en + "' / '" + updatedWord.word_es + "'");
        res.redirect('/word/list');
      });
      
    });
  });
  
  
  app.get('/word/:word/delete', app.restrictUser, app.connectDb, function(req, res) {
    console.log('deleting:', req.word);
    WordHandler.remove(req.db, req.word._id, function(error) {
      if (error) {
        req.flash('error', error.message);
        return res.redirect('back');
      }
      req.flash('info', "Successfully deleted word '" + req.word.word_en + "' / '" + req.word.word_es + "'");
      res.redirect('/word/list');
    });
  });
  
};
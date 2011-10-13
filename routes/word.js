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

// app passed as closure
module.exports = function(app){

  // process :word param when passed
  // [how does connectDb middleware work here?]
  app.param('word', app.restrictUser, app.connectDb, function(req, res, next, id){
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
  
  
  app.get('/word', app.restrictUser, app.connectDb, function(req, res) {
    res.redirect('/word/list');
  });
  
  app.get('/word/list', app.restrictUser, app.connectDb, function(req, res) {
    WordHandler.getAll(req.db, function(error, words) {
      if (error) {
        req.flash('error', "Error: " + util.inspect(error));
        res.redirect('back');
      }
      else {
        // console.log('words:', words);
        
        res.render('word/list', {
          pageTitle: 'List',
          words: words,
          showWordLinks: true
        });
      }
    });
  });
  
  
  app.get('/word/add', app.restrictUser, app.connectDb, function(req, res) {
    res.render('word/form', {
      locals: {
        word: new WordHandler(),    // empty
        pageTitle: 'Add a Word',
        action: '/word',
        
        // for dropdown
        types: _.map(WordHandler.getTypes(), function(value, key) {
          return { key: key, value: value, selected: false };
        })
      }
    });
  });

  
  
  app.get('/word/:word/edit', app.restrictUser, app.connectDb, function(req, res) {
    res.render('word/form', {
      locals: {
        word: req.word,   // from app.param()
        
        action: '/word/' + req.word._id,
        
        pageTitle: 'Edit Word',
        
        // for dropdown
        types: _.map(WordHandler.getTypes(), function(value, key) {
          return { 
            key: key,
            value: value,
            selected: (req.word.type == key)
          };
        })
      }
    });
    
  });
  

  // after all the fixed /word/X, assume X is an ID.
  app.get('/word/:word', app.restrictUser, app.connectDb, function(req, res) {
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
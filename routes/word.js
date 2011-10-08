// routes: /word/*

/*
new url structure:
- /word/new
- /word/:word
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
  app.param('word', function(req, res, next, id){
    console.log('processing word param:', id);
    
    WordHandler.getById(id, function(error, word) {
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
  
  
  app.get('/word', function(req, res) {
    res.redirect('/word/list');
  });
  
  app.get('/word/list', function(req, res) {
    WordHandler.getAll(function(error, words) {
      if (error) {
        req.flash('error', "Error: " + util.inspect(error));
        res.redirect('back');
      }
      else {
        // console.log('words:', words);
        
        res.render('word/list', {
          pageTitle: 'List',
          words: words
        });
      }
    });
  });
  
  
  // after all the fixed /word/X, assume X is an ID.
  app.get('/word/:word', function(req, res) {
    res.render('word/word', {
      locals: {
        word: req.word,
        pageTitle: ''
      }
    });
  });
  
};
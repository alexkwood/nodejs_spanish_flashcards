// routes: /play/*

var WordHandler = require('../models/word.js');     // don't use 'Word' name to avoid confusion
var util = require('util');
var _ = require('underscore')._;


// app passed as closure
module.exports = function(app){

  // mark a word in the session as played.
  app.logPlayedWord = function(req, wordId) {
    if (_.isUndefined(req.session.playedWords)) {
      req.session.playedWords = [];
    }
    
    req.session.playedWords.push(wordId);
    
    // console.log("recorded played word:", wordId);
  };

  // get an array of word IDs from the session,
  // for words played SUCCESSFULLY in this match.
  app.getPlayedWords = function(req) {
    if (_.isUndefined(req.session.playedWords)) {
      return [];
    }
    else {
      return req.session.playedWords;
    }
  };


  // word param for /play/:word/correct. dif from :word in /word/* routes.
  app.param('word', function(req, res, next, id){
    // only track the ID, don't need the word obj here.
    req.wordId = id;
    
    next();
  });
  
  // mark a word as successfully played.
  app.get('/play/:word/correct', function(req, res) {
    // console.log("correct: ", req.wordId);
    
    app.logPlayedWord(req, req.wordId);
    
    // onto next word
    res.redirect('/play');
  });
  
  // doesn't do anything special
  app.get('/play/:word/incorrect', function(req, res) {
    // onto next word
    res.redirect('/play');
  });
  
  
  // reset the played words
  app.get('/play/restart', function(req, res) {
    req.session.playedWords = [];
    
    req.flash('info', "Restarted Game");
    
    res.redirect('/play');
  });
  
  
  // play the next word
  app.get('/play', /*app.restrictUser,*/ app.connectDb, function(req, res) {

    // word shown can be in either language
    var langCodes = _.keys(global.wordLanguages);    
    var lang = langCodes[ Math.floor( Math.random() * langCodes.length ) ];

    // get a random modeled word, skip words already played successfully.
    
    // (this bypasses the word.js intermediary... is the intermediary necessary at all?)
    var MongoHandler = require('../db/mongodb.js');
    
    var query = { '_id' : 
      { '$nin' : 
        // get an ID object for each ID string      
        _.map(app.getPlayedWords(req), function(id) {
          return MongoHandler.objectID(id);
        })
      } 
    };
    
    WordHandler.getRandom(req.db, query, function(error, word, count) {
      if (error) {
        req.flash('error', "Error: " + util.inspect(error));
        res.redirect('/word/list');
      }
      else if (count === 0) {    // out of words!
        res.render('play', {
          pageTitle: 'Play',
          gameOver: true,
          showWordLinks: true,
          question: null,
          langCode: null,
          language: null,
          word: null,
          remaining: count
        });
      }
      else {
        // console.log('random word:', word);
        
        if (_.isUndefined(word['word_' + lang])) {
          req.flash('error', "Error: Missing " + global.wordLanguages[lang] + " word.");
          res.redirect('/word/list');
        }
        
        res.render('play', {
          pageTitle: 'Play',
          question: word['word_' + lang],     // shown word
          langCode: lang,
          language: global.wordLanguages[lang].toLowerCase(),
          word: word,
          gameOver: false,
          showWordLinks: true, //false
          remaining: count
        });
      }
    }); //getRandom

  });  //app.get
  
};
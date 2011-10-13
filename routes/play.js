// routes: /play/*

var WordHandler = require('../models/word.js');     // don't use 'Word' name to avoid confusion
var util = require('util');
var _ = require('underscore')._;


// app passed as closure
module.exports = function(app){
  
  app.get('/play', app.connectDb, function(req, res) {

    // word shown can be in either language
    var langCodes = _.keys(global.wordLanguages);    
    var lang = langCodes[ Math.floor( Math.random() * langCodes.length ) ];

    // get a random modeled word.
    WordHandler.getRandom(req.db, function(error, word) {
      if (error) {
        req.flash('error', "Error: " + util.inspect(error));
        res.redirect('/word/list');
      }
      else {
        console.log('random word:', word);
        
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
          showWordLinks: true //false
        });
      }
    }); //getRandom

  });  //app.get
  
};
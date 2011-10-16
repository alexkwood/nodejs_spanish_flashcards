var _ = require('underscore')._;

var WordReference = require('../wordreference/wordreference.js');

var util = require('util');

// app passed as closure
module.exports = function(app){

  app.get('/lookup', app.restrictUser, /*app.connectDb,*/ function(req, res) {
    res.render('lookup', {
      locals: {
        pageTitle: 'Lookup a word with WordReference API',
        result: null,
        words: {}
      }
    });
  });

  app.post('/lookup', app.restrictUser, /*app.connectDb,*/ function(req, res) {
    var wr = new WordReference(app.config.wordreference_api_key);     // @todo handle missing key

    var body = ''
      , dictionary 
      , word
      , compounds = null
      , definitions = null;
    
    if (!_.isEmpty(req.body.word_es)) {
      dictionary = 'esen';
      word = req.body.word_es;
    }
    else if (!_.isEmpty(req.body.word_en)) {
      dictionary = 'enes';
      word = req.body.word_en;
    }
    else {
      req.flash('error', "Needs a word to lookup!");
      res.redirect('back');
    }
    
    // for TESTING - French dictionary is better
    // dictionary = 'enfr';
    // req.flash('warning', 'Temporarily forcing French dictionary!');
    
    wr.query(dictionary, word, function(error, result) {
      if (error) {
        body += 'Error: ' + '<pre>' + util.inspect(error) + '</pre>' + '<br/><br/>';
        body += 'Result: ' + '<br/>' + '<pre>' + result + '</pre>' + '<br/><br/>';
      }
      else {
        var parsed = wr.parse(result);
        
        // add links to definitions
        _.forEach(parsed.definitions, function(definition){
          definition.addWordUrl = '/word/add?'
            + (dictionary == 'esen' ? 
                'word_es=' + word + '&word_en=' + definition.term + '&type=' + definition.POS + '&'
              : 'word_en=' + word + '&word_es=' + definition.term + '&type=' + definition.POS + '&'
            );
            // note: type/POS here not the same as in the form. will most likely be ignored.
        });

        definitions = parsed.definitions;
        compounds = parsed.compounds;
        body += parsed.raw;
      }
      
      res.render('lookup', {
        locals: {
          pageTitle: 'Lookup: ' + word,
          words: req.body,
          result: body,
          definitions: definitions,
          compounds: compounds
        }
      });
    });
  });
  
};
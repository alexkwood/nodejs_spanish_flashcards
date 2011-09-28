/* model for 'words'
    (put in /models dir, but not using a real MVC framework)
*/

// @todo how to make this global?? already loaded in app.js.
var _ = require('underscore')._;

// simple model for Words (class)
WordModel = function(word) {
  // merge w/ defaults
  word = _.extend({
    word_es: '',
    word_en: '',
    type: '',
    created: new Date()
  }, word);
  
  return word;
};

exports.WordModel = WordModel;
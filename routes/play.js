// routes: /play/*

// app passed as closure
module.exports = function(app){
  
  app.get('/play', function(req, res) {
    app.use(express.bodyParser());

    //@todo separate this to its own controller
    var debug = '';

    // show which language
    var langs = ['es','en'];
    var lang = langs[ Math.floor( Math.random() * _.size(langs) ) ];

    // get a random word...

    flashcardHandler.getRandom(global.wordsCollection, function(error, results) {
      if (error) {
        app.prettyError(util.inspect(error), req, res);    //END.
      }
      else {
        // debug += util.inspect(results) + '<br/>';
        var word = new WordModel(results);

        // debug += util.inspect(word) + '<br/>';

        // render page w/ results
        res.render('play', {
          pageTitle: 'Play',
          word: word,
          lang: lang,
          question: word['word_' + lang],
          extraScripts: [
            '/javascripts/play.js'
          ]
          // , debug: debug
        });
      }
    });

  });
  
  
};
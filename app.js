// Spanish Flashcards app -- learning node.js & express.js with mongodb

var express = require('express'),
    app = module.exports = express.createServer(),
    // events = require('events'),
    sys = require('sys'),
    util = require('util'),
    fs = require('fs'), //?
    parse = require('url').parse,
    forms = require('forms'),
    fields = forms.fields,    // all needed here?
    widgets = forms.widgets,
    validators = forms.validators,
    _ = require('underscore')._   //,
    // wordModel = require('./models/word')
    ;

// db handler [generic]
require('./controllers/flashcard-mongodb.js');

// [quasi] models
require('./models/word');

// global vars -- [is this bad form?]
global.dbName = 'flashcards';
global.wordsCollection = 'words';


// instantiate a db/model handler
var flashcardHandler = new FlashcardHandler();

// custom event handler
// var eventEmitter = new events.EventEmitter;

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  // app.use(express.bodyParser());   // THIS BREAKS FORMS MODULE! (TURN OFF FOR STANDARD FORM HANDLING)
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


// global vars -- is there a simpler way to do this?
app.appTitle = 'Ben\'s Spanish Flashcards';
app.dynamicHelpers({
//   appTitle: function(req,res) { return app.appTitle; }
//   , title: function(req,res) {
//       // console.log(res);
//       return 'title: ' + app.appTitle;
//     }
  addWordForm: function(req, res) {
    return 'some text';
  }
});


app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});



// Routes

app.get('/', function(req, res){
  res.render('home', {
    // layout: 'alternate.jade',
    locals: {
      pageTitle : ''
    }
  });
});




// form page loaded (not submitted)
app.get('/add', function(req, res) {
  var wordForm = new WordForm();
  wordForm.render(req, res, {});
});


// form submitted
app.post('/add', function(req, res) {
  
  var wordForm = new WordForm();

  // @todo consolidate further
  wordForm.form.handle(req, {
    
    // form passed validation - save the word!
    success: function(form) {
      console.log('form data: ' + util.inspect(form.data) + '\n');

      var word = new WordModel(form.data);
      console.log('word to save:', word);
      
      flashcardHandler.save(global.wordsCollection, word, function(error, results) {
        if (error) {
          // allow object or string
          var errorStr = error;
          if (! _.isString(errorStr)) errorStr = util.inspect(errorStr);
          
          errorStr = "Unable to save the word: " + errorStr;

          app.prettyError(errorStr, req, res);    //END.
        }
        else {
          var newWord = _.toArray(results).pop();
          
          // render page w/ results
          wordForm.form.bind({});
          wordForm.render(req, res, { 
            success:true, 
            results: newWord.word_es + ' / ' + newWord.word_en
          });
        }
      });
      
    },
    
    // did not pass validation, re-render
    other: function(form) {
      wordForm.render(req, res, {});
    }
  });
});



app.get('/list', function(req, res) {
  app.use(express.bodyParser());
  // -- makes req.query available for qstr vars --
  
  flashcardHandler.findAll(global.wordsCollection, function(error, docs) {
    if (error) app.prettyError(error, req, res);
    else {
      res.render('list', {
        pageTitle: 'List',
        words: docs
        // , debug: '<pre>' + util.inspect(req) + '</pre>'
        // , debug: '<pre>' + util.inspect(docs) + '</pre>'
      });
    }
  });
});


// (edit form goes to /add path w/ ID in form)
app.get('/edit/:id', function(req, res) {
  var id = req.param('id');
  flashcardHandler.getById( global.wordsCollection, id, function(error, results) {
    console.log('getById results: ', results);
    
    if (error) app.prettyError(error, req, res);
    
    var word = new WordModel(results);
    console.log('modeled word to edit: ', word);
    
    var wordForm = new WordForm();
    wordForm.render(req, res, {
      edit: word
    });
  });
});


app.get('/delete/:id', function(req, res) {
  var id = req.param('id');
  flashcardHandler.remove( global.wordsCollection, id, function(error, results) {
    if (error) app.prettyError(error, req, res);
    res.render('index', {
      pageTitle: 'Delete',
      debug: 'ID: ' + id + '<br/>' + util.inspect(results)
    });
  });
});


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


// @todo find a more express-y way to do this.
app.prettyError = function(error, req, res) {
  res.render('error', {
    pageTitle: 'An error occurred',
    error: error      // (assume string)
  });
}

// test error
app.get('/error', function(req, res){
  app.prettyError({'msg':'A fake error'}, req, res);
});


app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

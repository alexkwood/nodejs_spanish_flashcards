// Spanish Flashcards app -- learning node.js & express.js with mongodb

// how to make this global?
require.paths.unshift('/opt/node_libraries');

var express = require('express'),
    app = module.exports = express.createServer(),
    // events = require('events'),
    sys = require('sys'),
    util = require('util'),
    fs = require('fs'), //?
    //mongodb = require("mongodb"), // not needed w/Mongoose?   moved to controller
    // mongoose = require('mongoose'),
    flashcards = require('./controllers/flashcard-mongodb.js').FlashcardHandler,
    forms = require('forms'),
    parse = require('url').parse,
    fields = forms.fields,
    validators = forms.validators,
    _ = require('underscore')._   //,
    // wordModel = require('./models/word')
    ;

// [quasi] models
require('./models/word');

// why is this necessary?
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


// handle the Add Word form, as a GET (initial) or POST (submitted) request.
// @todo merge this into the handler/model file ... would be great to have unified model/form generator!
app.addWordForm = {
  
  // no way to set default values?
  // from issue q -- 'Just pass your data object into form.bind()' (@todo)
  form : forms.create({
    word_es: fields.string({ label: 'Spanish', required: true }),
    word_en: fields.string({ label: 'English', required: true }),
    type: fields.string({ label: 'Type' //, widget: 'select', 
      // choices: {
      //   '': '',
      //   'n': 'noun',
      //   'v': 'verb',
      //   'adv': 'adverb',
      //   'pro': 'pronoun',
      // }
    })
  }),
  
  render : function(req, res, locals) {
    locals = _.extend({
        success: false,
        pageTitle: 'Add a Word',
        form: app.addWordForm.form.toHTML(),
        results: null
      },
      locals    // overrides
    );
  
    // clear the form on successful submit, to add another
    if (locals.success) {
      app.addWordForm.form.bind({});
      locals.form = app.addWordForm.form.toHTML();    // re-render
    }
  
    res.render('add', {
      locals: locals
    });
  }  //render
  
};


// form page loaded (not submitted)
app.get('/add', function(req, res) {
  app.addWordForm.render(req, res, {});
});

// form submitted
app.post('/add', function(req, res) {
  app.addWordForm.form.handle(req, {
    
    // form passed validation - save the word!
    success: function(form) {
      console.log('form data: ' + util.inspect(form.data) + '\n');

      var word = new WordModel(form.data);
      console.log('word:', word);
      
      flashcardHandler.addWord(word, function(error, results) {
        if (error) {
          // allow object or string
          var errorStr = error;
          if (! _.isString(errorStr)) errorStr = util.inspect(errorStr);
          
          errorStr = "Unable to save the word: " + errorStr;

          app.prettyError(errorStr, req, res);    //END.
        }
        else {
          // render page w/ results
          app.addWordForm.render(req, res, { success:true, results: util.inspect(results) });
        }
      });
      
    },
    
    // did not pass validation, re-render
    other: function(form) {
      app.addWordForm.render(req, res, {});
    }
  });
});



app.get('/list', function(req, res) {
  app.use(express.bodyParser());
  // -- makes req.query available for qstr vars --
  
  flashcardHandler.findAll('words', function(error, docs) {
    if (error) app.prettyError(error, req, res);
    else {
      res.render('list', {
        pageTitle: 'List',
        words: docs
        // , debug: '<pre>' + util.inspect(req) + '</pre>'
      });
    }
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
  
  flashcardHandler.getRandom('words', function(error, results) {
    if (error) {
      app.prettyError(util.inspect(error), req, res);    //END.
    }
    else {
      debug += util.inspect(results) + '<br/>';
      var word = new WordModel(results);

      debug += util.inspect(word) + '<br/>';
      
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

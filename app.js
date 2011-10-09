// Spanish Flashcards app -- learning node.js & express.js with mongodb

// @todo figure out which of these are really necessary
var express = require('express'),
    app = module.exports = express.createServer(),
    // messages = require('express-messages'),
    messages = require('./messages'),
    // events = require('events'),
    sys = require('sys')
    // util = require('util')
    // fs = require('fs'), //?
    // parse = require('url').parse,
    // forms = require('forms'),
    // fields = forms.fields,    // all needed here?
    // widgets = forms.widgets,
    // validators = forms.validators,
    // _ = require('underscore')._   //,
    // wordModel = require('./models/word')
    ;

// [quasi] models
// require('./models/word');

// global vars -- [is this bad form?]
// global.dbName = 'flashcards';
// global.wordsCollection = 'words';
global.appTitle = 'Ben\'s Spanish Flashcards';

global.wordLanguages = {
  "en": "English",
  "es": "Spanish"
};

// instantiate a db/model handler
// var flashcardHandler = new FlashcardHandler();


// [what's the difference between putting here or inside app.configure() ??]
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


// middleware
app.dynamicHelpers({
  appTitle: function(req,res) { return global.appTitle; }

  , messages: messages        // from express-messages module, use req.flash() to populate.

  // return the app's mount-point so that urls can adjust
  , base: function(){
    return '/' == app.route ? '' : app.route;
  }
});

// Configuration
app.configure(function(){
  app.use(express.bodyParser());   // [doesn't work w/ 'forms' module. not using anymore.]
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'quien es' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});


// per-environment config
// app.configure('development', function(){
//   app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
// });
// 
// app.configure('production', function(){
//   app.use(express.errorHandler()); 
// });



// Routes

// delegate routers w/ closures
require('./routes/home.js')(app);
require('./routes/word.js')(app);
require('./routes/play.js')(app);


// // form page loaded (not submitted)
// app.get('/add', function(req, res) {
//   var wordForm = new WordForm();
//   wordForm.render(req, res, {});
// });


// // form submitted
// app.post('/add', function(req, res) {
//   var wordForm = new WordForm();
//   wordForm.handle(req, res, flashcardHandler);
// });

// // (edit form goes to /add path w/ ID in form)
// app.get('/edit/:id', function(req, res) {
//   var id = req.param('id');
//   flashcardHandler.getById( global.wordsCollection, id, function(error, results) {
//     if (error) return app.prettyError(error, req, res);
//     
//     var word = new WordModel(results);
//     
//     var wordForm = new WordForm();
//     wordForm.render(req, res, {
//       edit: word
//     });
//   });
// });

// // edit via post same as via get
// app.post('/edit/:id', function(req, res) {
//   var id = req.param('id');
//   flashcardHandler.getById( global.wordsCollection, id, function(error, results) {
//     if (error) return app.prettyError(error, req, res);
//     
//     var word = new WordModel(results);
//     console.log('modeled word to edit: ', word);
//     
//     var wordForm = new WordForm();
//     wordForm.handle(req, res, flashcardHandler);
//     
//     
//     // GETTING ALL CONFUSED WITH THE handle() and render() ... this shouldn't be so complicated!!!!    
//   });
// });



// -- /list moved to routes/word.js


// app.get('/delete/:id', function(req, res) {
//   var id = req.param('id');
//   flashcardHandler.remove( global.wordsCollection, id, function(error, results) {
//     if (error) app.prettyError(error, req, res);
//     res.render('index', {
//       pageTitle: 'Delete',
//       debug: 'ID: ' + id + '<br/>' + util.inspect(results)
//     });
//   });
// });



// catch everything else
/*app.all('*', function(req, res, next) {
  res.render('error', {
    pageTitle: 'Not Found',
    error: 'The requested page does not exist.'
  });
});
*/

// @todo find a more express-y way to do this. -- flash messages?
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

if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);  
}
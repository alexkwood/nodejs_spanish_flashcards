// Spanish Flashcards app -- learning node.js & express.js with mongodb

// how to make this global?
require.paths.unshift('/opt/node_libraries');

var express = require('express'),
    app = module.exports = express.createServer(),
    events = require('events'),
    sys = require('sys'),
    mongodb = require("mongodb"),
    Flashcard = require('./flashcard.js').Flashcard
    ;

// custom event handler
// var eventEmitter = new events.EventEmitter;

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  // global vars -- doesn't work, crashes w/ memory allocation error
  // app.set('view options', g);
});


// global vars -- is there a simpler way to do this?
app.appTitle = 'Ben\'s Spanish Flashcards';
// app.dynamicHelpers({
//   appTitle: function(req,res) { return app.appTitle; }
//   , title: function(req,res) {
//       // console.log(res);
//       return 'title: ' + app.appTitle;
//     }
// });


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
      pageTitle : 'Home'
    }
  });
});

app.get('/add', function(req, res) {
  res.render('add', {
    locals: {
      pageTitle : 'Add a Word'
    }
  });
});



app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

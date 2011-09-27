// Spanish Flashcards app -- learning node.js & express.js with mongodb

// how to make this global?
require.paths.unshift('/opt/node_libraries');

var express = require('express'),
    app = module.exports = express.createServer(),
    // events = require('events'),
    // sys = require('sys'),
    util = require('util'),
    // mongodb = require("mongodb"), // not needed w/Mongoose?
    mongoose = require('mongoose')  //,
    // Flashcard = require('./flashcard.js').Flashcard
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
  // console.log('get', req);
  
  res.render('add', {
    locals: {
      pageTitle : 'Add a Word',
      reqDump: util.inspect(req)
    }
  });
});

app.post('/add', function(req, res) {
  console.log('post body:', req.body);
  
  res.render('add', {
    locals: {
      pageTitle : 'Add a Word',
      reqDump: util.inspect(req)
    }
  });
});



// test mongo
app.get('/mongo', function(req, res) {
  
  var db = mongoose.connect({
    host: 'localhost',
    database: 'flashcards',
    port: 27017,
    options: {}
  });
  
  var Schema = mongoose.Schema, 
      ObjectId = Schema.ObjectId  // neces?
      ;

  var FlashcardSchema = new Schema({
      word_es   : String
    , word_en   : String
    , type      : { type: String }    // special case
    , created   : Date
  });
  
  var FlashcardModel = new mongoose.model('Flashcard', FlashcardSchema);
  
  var card = new FlashcardModel();
  card.my.word_es = 'esta noche';
  card.my.word_en = 'tonight';
  card.my.type = 'n';
  // card.my.created = new SchemaDate();    // ???
  card.save(function(err){
    res.write("ERROR!!!\n");
    res.write(util.inspect(err));
  });
  
  
  // old fashioned output
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.write('test\n');
  res.write('Hello World\n');
  res.end();  
});




app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

// Spanish Flashcards app -- learning node.js & express.js with mongodb

// @todo figure out which of these are really necessary
var express = require('express')
    , app = module.exports = express.createServer()
    , messages = require('./messages')   // [modified from lib]
    //, sys = require('sys')
    , _ = require('underscore')._
    ;

// [quasi] models
// require('./models/word');

global.appTitle = 'Ben\'s Spanish Flashcards';

global.wordLanguages = {
  "en": "English",
  "es": "Spanish"
};


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
  
    // generate a body class based on URL
  , bodyClass: function(req, res) {
      var parts = require('url').parse(req.url).pathname.split('/');
      parts = _.compact(parts);
      if (parts.length == 0) return 'home';
      return parts.join('-');
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


// middleware to get a DB connection.
// assign a DB connection to the request, or fail.
// this requires that req.db be passed to every function/handler needing a database connection.
app.connectDb = function(req, res, next) {
  var mongoHandler = require('./db/mongodb.js');

  req.db = new mongoHandler('flashcards', function(error){
    if (error) {
      req.flash('error', "Unable to connect to database.");
      res.render('home', {
        locals: {
          pageTitle : ''
        }
      });
    }
    else {
      next();
    }
  });
};


// Routes

// delegate routers w/ closures
require('./routes/home.js')(app);
require('./routes/word.js')(app);
require('./routes/play.js')(app);


if (!module.parent) {
  app.listen(3000);
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);  
}
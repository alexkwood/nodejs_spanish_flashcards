// Spanish Flashcards app -- learning node.js & express.js with mongodb

var express = require('express')
  , app = module.exports = express.createServer()
  , util = require('util')
  , messages = require('./messages')   // [modified from lib]
  , _ = require('underscore')._

  , args = require("argsparser").parse()
  ;

// allow --db arg to override name of db
var dbName = _.isUndefined(args['--db']) ? 'flashcards' : args['--db'];

  // general DB
var MongoHandler = require('./db/mongodb.js')
  , mongoHandler = new MongoHandler(dbName)

  // for sessions
  , MongoStore = require('connect-mongodb')
  , sessionStore = new MongoStore({db: mongoHandler.db, reapInterval: 3000, collection: 'sessions'})  
  ;

// remember the app route dir [is there a built-in var for this??]
app.baseDir = __dirname;

global.appTitle = _.isUndefined(args['--title']) ? "Ben's Spanish Flashcards" : args['--title'];

global.wordLanguages = {
  "en": "English",
  "es": "Spanish"
};

try {
  app.config = require('./config.js').config;
}
catch(e) {
  console.log("Missing config.js!");
  app.config = {};
  
  // stop all paths w/ error.
  app.get('*', function(req, res) {
    res.end("Missing config.js.");
  });
}

// [what's the difference between putting here or inside app.configure() ??]
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


// default/global view vars [can define functions that accept params from templates]
app.set('view options', {
  getWordType: require('./models/word').getWordType
});


// middleware [use as simple variables, _can't_ pass params into them from templates]
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
  
  , isLoggedIn: function(req, res) {
    return app.isLoggedIn(req);
  }
  
});

// Configuration
app.configure(function(){
  app.use(express.bodyParser());
  // app.use(express.methodOverride());    // necessary?
  app.use(express.cookieParser());
  
  app.use(express.session({ 
    secret: 'quien es', 
    cookie: {maxAge: 60000*60*24*30},   // 30 days?
    store: sessionStore
  }));
  
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


// route middleware to get a DB connection.
// previously, db connection was only in request.
// but with connect-mongo session store, apparently need global db obj.
// so this just opens it, and refs it to request... not sure if it still makes sense.
app.connectDb = function(req, res, next) {
  req.db = mongoHandler;      // ??
  
  req.db.open(function(error){
    if (error) {
      req.flash('error', "Unable to connect to database. " + util.inspect(error));
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


// check if user is logged in [used in multiple places]
app.isLoggedIn = function(req) {
  var _ = require('underscore')._;
  return (! _.isUndefined(req.session.loggedIn));
};

// route middleware to authenticate user.
app.restrictUser = function(req, res, next) {  
  // if (!_.isUndefined(req.session.loggedIn)) {
  if (app.isLoggedIn(req)) {
    next();   // logged in
  }
  else {
    req.flash('error', "Please login to do that.");
    res.redirect('/login');
  }
};


// Routes

// delegate routers w/ closures
require('./routes/login.js')(app);
require('./routes/home.js')(app);
require('./routes/word.js')(app);
require('./routes/play.js')(app);
require('./routes/lookup.js')(app);


// optionally set port and hostname with args,
// e.g. node app.js --host HOST --port PORT
var port = _.isUndefined(args['--port']) ? 3000 : args['--port'];     // number
var host = _.isUndefined(args['--host']) ? null : args['--host'];     // IP address (not host NAME)

// try to limit to host NAME -- this doesn't work, suggestions welcome.
// if (! _.isUndefined(args['--vhost'])) {
//   app.use( express.vhost( args['--vhost'], app ) ).listen(port, host);    
// }

if (!module.parent) {
  app.listen(port, host);      
  console.log("Express server listening to %s on port %d in %s mode", app.address().address, app.address().port, app.settings.env);  
}

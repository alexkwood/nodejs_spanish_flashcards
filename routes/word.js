// routes: /word/*

/*
new url structure:
- /word/new
- /word/:word
- /word/:word/edit
- /word/:word/delete
*/

// all DB handling goes thru model
var Word = require('../models/word.js');


// app passed as closure
module.exports = function(app){

  // process :word param when passed
  app.param('word', function(req, res, next, id){
    console.log('processing word param:', id);
    
    // ...
    
    next();   // [assume necessary?]
  });
  
  
  app.get('/word', function(req, res) {
    res.redirect('/word/list');
  });
  
  app.get('/word/list', function(req, res) {
    Word.getAll(function(error, docs) {
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
  
};
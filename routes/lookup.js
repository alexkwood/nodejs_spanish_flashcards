var _ = require('underscore')._;

var WordReference = require('../wordreference/wordreference.js');

var util = require('util');

// app passed as closure
module.exports = function(app){

  app.get('/lookup', app.restrictUser, /*app.connectDb,*/ function(req, res) {
    var wr = new WordReference(app.config.wordreference_api_key);     // @todo handle missing key
    
    // test
    wr.query('enes', 'pumpkin', function(error, result) {
      if (error) res.write('Error: ' + util.inspect(error) + '<br/><br/>');
      // res.write('Result: ' + util.inspect(result) + '<br/><br/>');

      res.write('Result: ' + '<br/>' + result + '<br/><br/>');
      
      res.end('Done.');
    });
  });
  
};
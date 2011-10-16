/** module for WordReference API integration **/

var http = require('http');
var _ = require('underscore')._;

/*
== TOS (http://www.wordreference.com/docs/api.aspx) ==
You must include the copyright line: © WordReference.com
You must link back to the term's entry on WordReference's website with the translation or equivalent of: 'term' at WordReference.com
No derivative works (without permission).
API data can only be stored and cached for 24 hours (without permission).
You are limited to 600 requests to the API per hour by default.
Cannot be used in: browser toolbars.
Cannot be used in an application or webpage whose primary function is as a dictionary or translator (without permission).
*/

var WR = module.exports = function(key) {
  this.key = key;
};

WR.prototype.version = function() {
  return '0.8';
};

// return a URL in array format like http.get() wants.
WR.prototype.url = function(dictionary, term) {
  /*
  http://api.wordreference.com/{api_version}/{API_key}/json/{dictionary}/{term}
  where {term} is the term being searched for, {dictionary} is the dictionary you want to search, 
  and {api_version} is the desired version of the API. 
  If {api_version} is omitted, the API will redirect to the latest version automatically. 
  ...the current version is 0.8.
  
  not using jsonp callback. ?
  */
  
  return {
    'host': 'api.wordreference.com',
    'port': 80,
    'path': "/" + this.version() + "/" + this.key + "/json/" + dictionary + "/" + term
  };
};


WR.prototype.query = function(dictionary, term, callback) {
  var url = this.url(dictionary, term);
  
  var options = _.extend(url, {
    'method': 'GET'
    // can add headers, agent, etc
  });

  // console.log('querying url:', url, 'with options:', options);
  
  var bodyParts = [];
  
  var req = http.request(options, function(res){
    console.log("Got WR response");
    
    res.setEncoding('utf8');
    
    res.on('data', function (chunk) {
      bodyParts.push(chunk);
      console.log('added body chunk');
    });
    
    res.on('end', function() {
      // == pass result back to server response here ==
      console.log('response END, callback.');
      console.log('have', bodyParts.length, 'body parts');
      
      try {
        var body = bodyParts.join('');
        var data = JSON.parse(body);
        callback(null, data);
      }
      catch(e) {
        console.log('error parsing json');
        callback(e, body);
      }
    });
  })
  .on('error', function(e) {
    console.log('http request error!', e);
    req.end();    //??
    callback(e);
  })
  .end();

};
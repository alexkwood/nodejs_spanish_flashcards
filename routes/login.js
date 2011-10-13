// Login form handling

var _ = require('underscore')._;

module.exports = function(app){

  app.get('/login', function(req, res){
    res.render('login', {
      locals: {
        pageTitle : 'Login'
      }
    });
  });


  // password entered
  app.post('/login', function(req, res){
    
    // use error catcher for multiple messages
    try {
      if (_.isUndefined(app.config.password)) {
        throw new Error("No password set in config.js");
      }
      
      else if (_.isUndefined(req.body.password)) {
        throw( new Error('No password entered.') );
      }
      
      else if (app.config.password === req.body.password) {
        req.session.regenerate(function(error){
          if (error) throw new Error("Unable to create session");
          else {
            // == only outcome here that isn't an error ==
            req.session.loggedIn = true;
            req.flash('info', 'Logged in!');
            res.redirect('/');
          }
        });
      }
      
      else {
        throw(new Error('Incorrect password'));
      }      
    }
    catch(e) {
      req.flash('error', e.message);    // "Unable to read password file."
      res.redirect('back');
    }
  }); //post
  
  
  
  app.get('/logout', function(req, res) {
    req.session.regenerate(function(){
      req.flash('info', 'Logged out.');
      res.redirect('/');
    });
  });

};

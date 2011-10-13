// Login form handling

var _ = require('underscore')._;
var fs = require('fs');

module.exports = function(app){

  app.get('/login', function(req, res){
    res.render('login', {
      locals: {
        pageTitle : 'Login'
      }
    });
  });


  app.post('/login', function(req, res){
    if (_.isUndefined(req.body.password)) {
      req.flash('error', 'No password entered.');
      res.redirect('back');
    }
    else {      
      fs.readFile('./PASSWORD', 'utf-8', function(error, password) {
        try {
          if (error) {
            throw new Error("Unable to read password file.");
          }
          else {
            password = password.trim();
            // req.flash('debug', "Password is: " + password);
            
            if (password === req.body.password) {
              req.session.regenerate(function(error){
                if (error) throw new Error("Unable to create session");
                else {
                  req.session.loggedIn = true;
                  req.flash('info', 'Logged in!');
                  res.redirect('/');
                }
              });
            }
            else {
              req.flash('error', 'Incorrect password');
              res.redirect('back');
            }
          }
        }
        catch(e) {
          req.flash('error', e.message);    // "Unable to read password file."
          res.redirect('/');
        }
      });
    }

  });
  
  
  app.get('/logout', function(req, res) {
    req.session.regenerate(function(){
      req.flash('info', 'Logged out.');
      res.redirect('/');
    });
  });

};

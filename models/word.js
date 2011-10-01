/* model for 'words'
    (put in /models dir, but not using a real MVC framework)
*/

// @todo how to make this global?? already loaded in app.js.
var _ = require('underscore')._;

// simple model for Words (class)
WordModel = function(word) {
  
  // merge w/ defaults
  word = _.extend({
    word_es: '',
    word_en: '',
    type: '',
    created: new Date()
  }, word);
  
  // is there an _id already set?
  if (! _.isUndefined(word._id)) {
    console.log('word already has id:', word._id);
    
    // var mongodb = require("mongodb");
    // var BSON = require('mongodb').BSONPure;
    // word._id = BSON.ObjectID(word._id);
  }
  
  return word;
};

exports.WordModel = WordModel;

////////////////////////////////////////////

WordForm = function() {

  // load modules
  var forms = require('forms'),
  fields = forms.fields,
  widgets = forms.widgets;
  
  this.form = forms.create({
    word_es: fields.string({ label: 'Spanish', required: true }),
    word_en: fields.string({ label: 'English', required: true }),
    type: fields.string({ 
      label: 'Type', 
      widget: widgets.select(),
      choices: {
        '': '',
        'n': 'noun',
        'v': 'verb',
        'adv': 'adverb',
        'pro': 'pronoun'
      }
    }),
    _id: fields.string({ label: null, widget: widgets.hidden(), id: 'edit_id' })    
  });   // (this.form has property 'fields' which can be modified)


  // set defaults and render
  this.render = function(req, res, locals) {
    // clear the form on successful submit, to add another
    if (!_.isUndefined(locals.success)) {
      if (locals.success === true) {  // @todo consolidate?
        this.form.bind({});
        console.log('cleared form\n');
      }
    }
    
    // edit an existing word?
    if (!_.isUndefined(locals.edit)) {
      
      // hidden field for _id
      // == this is probably a bad approach, should use the :id already in the URL ==
      // this.form.fields._id = fields.string({ label: null, widget: widgets.hidden(), id: 'edit_id' });
      
      this.form.bind( locals.edit );
      console.log('binding:', locals.edit);
      locals.pageTitle = 'Edit Word';
    }
    
    
    locals = _.extend({
        success: false,
        pageTitle: 'Add a Word',
        form: this.form.toHTML(),
        results: null
      },
      locals    // overrides
    );
    
    res.render('add', {
      locals: locals
    });

  };  //render
  
};  //WordForm

exports.WordForm = WordForm;
// client-side game JS

$(function(){
  
  $('#play a#show').click(function(event){
    event.preventDefault();
    
    $('#answer').show();
    $('a#show').hide();
  });
  
  
  $('.links a.delete').click(function(event) {
    if (! confirm("Sure?") ) {
      event.preventDefault();
      return false;
    }
  });
  
  
  if ($('form#login').size()) {
    $('form#login').find('input.password').focus();
  }


  if ($('form#add-word').size()) {
    var toggleNewGroup = function() {
      if ($('form#add-word select#group').val() == 'new') {
        $('form#add-word input#new_group').show();
      }
      else {
        $('form#add-word input#new_group').hide();
      }
    };
    
    $('form#add-word select#group').bind('change', toggleNewGroup);
    toggleNewGroup();
  }
  
});
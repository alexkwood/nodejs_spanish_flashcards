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
  
});
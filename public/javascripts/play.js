// client-side game JS

$(function(){
  $('a#show').click(function(event){
    event.preventDefault();
    
    $('#answer').show();
    $('a#show').hide();
  });
});
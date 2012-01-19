jQuery(function($){
  var loc = location;
  var socket = io.connect(loc.protocol + '//' + loc.hostname);
  socket.on('log', function(data) {
    var messages = {};
    messages['new-user'] = "Un nuovo utente si e' registrato: " + data.data.subject;
    messages['preference'] = data.data.username + " ha espresso la sua preferenza: " + data.data.subject;

    $('#log').prepend($('<li>').html(messages[data.type]));
  });
  
  socket.on('update places', function(places) {
    for (place in places) {
      $places = $('div#places');
      $ul = $('ul.' + place, $places);
      if (!$ul.length) {
        $h1 = $('<h1>').text(place);
        $places.append($h1);

        $ul = $("<ul>").attr('class', place);
        $places.append($ul);
      }
      $ul.empty();
      for (preference in places[place].preferences) {
        $ul.append($('<li>').text(preference));
      }
    }
  });
  

  $userForm = $('#user-form');
  $preferenceForm = $('#preference-form').hide();
  $userForm.on('submit', function(e){
    socket.emit('set username', $('#username').val());
    $userForm.hide();
    $preferenceForm.show();
    return false;
  });
  $('input[name=place]').on('click', function(e){
    socket.emit('preference', $('input[name=place]:checked').val());
  });
});
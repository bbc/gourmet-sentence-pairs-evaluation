$(document).ready(function() {
  $('#slider').slider({
    max: 100,
    value: 50,
    slide: function(event, ui) {
      $('#sliderVal').val(ui.value);
    },
  });
});

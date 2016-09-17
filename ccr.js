$('.modalzinho').on('click', function () {
  var target = $(this).closest('td').siblings(':first-child').text();
  console.log(target);
});

$(document).ready(function() {
  $('select').material_select();
  $('.modal-trigger').leanModal();
  $(".modal-content").append('aa'); //Colocar aqui select do banco
  // var $modal = $(".modal-content")
});

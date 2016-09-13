$('.modalzinho').on('click', function () {
    var target = $(this).closest('td').siblings(':first-child').text();
    console.log(target);
    makemodal()
});

function makemodal() {
  var $modal = $(".modal-content")
}

// https://github.com/mapbox/node-sqlite3/wiki/API
const db = nodeRequire('electron').remote.getGlobal('db');

$(".autocomplete").autocomplete({
  minLength: 0,
  source: function(request, response) {
    var results = [];
    var tis = this.element[0];
    var table = tis.getAttribute("id");
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
    db.each("select * from " + table, function(err, row) {
      var i = 0;
      var pk = null, label = "";
      $.each(row, function(key, value) {
        if (i === 0) {
          pk = value;
        }
        else {
          if (i > 1) label += " ";
          label += value;
        }
        i++;
      });
      label += " (" + pk + ")";
      if (matcher.test(label)) {
        results.push({
          id: pk,
          target: table + "Id",
          value: label
        });
      }
    }, function(err, nrows) {
      response(results);
    });
  },
  select: function(event, ui) {
    document.getElementById(ui.item.target).value = ui.item.id;
  }
});

$(".save").click(function(event) {
  var target = event.currentTarget;
  var table = target.name;
  var $elem = $("." + table);
  $elem.each(function(index, el) {
    console.log(el);
    if (el.value == "") {
      $("#" + el.getAttribute("from")).addClass("invalid");
      Materialize.toast("O campo '" + el.name + "' é obrigatório", 2000);
    }
  });
});

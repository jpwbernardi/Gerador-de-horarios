// https://github.com/mapbox/node-sqlite3/wiki/API
const db = nodeRequire('electron').remote.getGlobal('db');

$(".autocomplete").autocomplete({
  minLength: 0,
  autoFocus: true,
  source: function(request, response) {
    var results = [];
    var $tis = $(this.element[0]);
    var table = $tis.attr("id");
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
    var query = "select ";
    var field = $tis.attr("select-field"),
      from = $tis.attr("select-from"),
      group = $tis.attr("select-group-by"),
      order = $tis.attr("select-order-by");
    if (typeof field !== typeof undefined && field !== "") query += field;
    else query += "*";
    query += " from ";
    if (typeof from !== typeof undefined && from !== "") query += from;
    else query += table;
    if (typeof group !== typeof undefined && group !== "") query += " group by " + group;
    if (typeof order !== typeof undefined && order !== "") query += " order by " + order;
    console.log(query);
    db.each(query, function(err, row) {
      var keys = Object.keys(row);
      var pk = row[keys[0]], label = "";
      if (keys.length === 1)
        label = row[keys[0]];
      else {
        label += row[keys[1]];
        for (let i = 2; i < keys.length; i++)
          label += " " + row[keys[i]];
        label += " (" + pk + ")";
      }
      if (matcher.test(label))
        results.push({
          id: pk,
          target: $tis.attr("target"),
          value: label
        });
    }, function(err, nrows) {
      response(results);
    });
  },
  select: function(event, ui) {
    document.getElementById(ui.item.target).value = ui.item.id;
  }
});

$(".autocomplete").change(function(event) {
  if (event.currentTarget.value === "") {
    $("#" + event.currentTarget.getAttribute("target")).val("");
  }
});

$(".save").click(function(event) {
  var target = event.currentTarget;
  var table = target.name;
  var $elems = $("." + table);
  var correct = true;
  $elems.each(function(index, el) {
    if (el.value === "") {
      $("#" + el.getAttribute("from")).addClass("invalid");
      Materialize.toast("O campo '" + el.name + "' é obrigatório", 2000);
      correct = false;
    }
  });
  if (correct) {
    let params = [];
    let query = "insert into " + table + " values (";
    let first = true;
    $elems.each(function(index, el) {
      if (!first) {
        query += ", "
      }
      query += "?";
      first = false;
      console.log(el);
      params.push(el.value);
    });
    query += ")";
    console.log(query);
    console.log(params);
    db.run(query, params, function(err) {
      if (err !== null) {
        Materialize.toast(err, 3000);
      } else {
        Materialize.toast("Registro salvo com sucesso!", 2000);
      }
    });
  }
});

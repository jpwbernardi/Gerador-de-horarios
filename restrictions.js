// https://github.com/mapbox/node-sqlite3/wiki/API
const db = nodeRequire('electron').remote.getGlobal('db');

$(".autocomplete").autocomplete({
  minLength: 0,
  // autoFocus: true, // automatically focus the first item in result list
  source: function(request, response) {
    var results = [];
    var $tis = $(this.element[0]);
    var table = $tis.attr("id");
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
    var query = "select ";
    var field = $tis.attr("select-field"),
      from = $tis.attr("select-from"),
      whereField = $tis.attr("select-where"),
      whereValue = "",
      params = [],
      group = $tis.attr("select-group-by"),
      order = $tis.attr("select-order-by");
    if (typeof field !== typeof undefined && field !== "") query += field;
    else query += "*";
    query += " from ";
    if (typeof from !== typeof undefined && from !== "") query += from;
    else query += table;
    if (typeof whereField !== typeof undefined && whereField !== "") {
      let $whereField = $("#" + whereField);
      whereValue = $whereField.val();
      if (typeof whereValue !== typeof undefined && whereValue !== "") {
        query += " where " + whereField + " = :" + whereField;
        params.push(whereValue);
      }
      else {
        $whereField.addClass("invalid");
        Materialize.toast("Selecione o " + $whereField.attr("title") + " primeiro!", 2000);
        response();
        return;
      }
    }
    if (typeof group !== typeof undefined && group !== "") query += " group by " + group;
    if (typeof order !== typeof undefined && order !== "") query += " order by " + order;
    console.log("LOG_INFO: " + query);
    db.each(query, params, function(err, row) {
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

// Why doesn't work?
// $(".combo-caret").click(function(event) {
//   $("#" + event.currentTarget.getAttribute("target")).autocomplete("search", "");
// });

$(".autocomplete").change(function(event) {
  if (event.currentTarget.value === "") {
    $("#" + event.currentTarget.getAttribute("target")).val("");
  }
});

$(".save").click(function(event) {
  var i;
  var table = event.currentTarget.name;
  var elems = $("." + table);
  var correct = true;
  for (i = 0; i < elems.length; i++) {
    if (elems[i].value === "") {
      $("#" + elems[i].getAttribute("from")).addClass("invalid");
      Materialize.toast("O campo '" + elems[i].name + "' é obrigatório", 2000);
      correct = false;
    }
  }
  if (correct) {
    let params = [elems[0].value];
    let query = "insert into " + table + " values (?";
    for (i = 1; i < elems.length; i++) {
      query += ", ?";
      if (elems[i].type === "checkbox")
        params.push(elems[i].checked);
      else params.push(elems[i].value);
    }
    query += ")";
    console.log("LOG_INFO: " + query);
    console.log("LOG_INFO: " + params);
    db.run(query, params, function(err) {
      if (err !== null) {
        console.log("LOG_ERR: " + err);
        Materialize.toast(err, 3000);
      } else {
        Materialize.toast("Registro salvo com sucesso!", 2000);
      }
    });
  }
});

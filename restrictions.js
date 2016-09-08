// buildLists();

function listRestrictions() {
  var $lists = $(".restriction-lists");
  $(".form-save").each(function(index, button) {
    var table = button.getAttribute("table");
    var query = "select * from " + table;
    var $row = $createElement("div", {
      "class": "row"
    });
    db.each(query, function(err, row) {
      var keys = Object.keys(row);
      for (let i = 1; i < keys.length; i++) {
        let ssize = "s" + field_sizes[table][i - 1];
        let $col = $createElement("div", {
          "class": "input-field col " + ssize
        });
        let $elem = $createElement("input", makeAttr(table, "input", i - 1));
        let uiString = "select " + field_string[table]["field"][i - 1] + " from " + field_string[table]["table"][i - 1] + " where " + keys[i] + " = ?";
        db.get(uiString, row[keys[i]], function(err, frow) {
          $elem.attr("value", frow[field_string[table]["field"][i - 1]]);
        });
        $col.append($elem);
        $elem = $createElement("input", makeAttr(table, "id", i - 1));
        $elem.attr("value", row[keys[i]]);
        $col.append($elem);
        $elem = $createTextualElement("label", makeAttr(table, "label", i - 1), field_attributes[table]["label"][index]["title"]);
        if (typeof row[keys[i]] != "undefined" && row[keys[i]] !== "") $elem.addClass("active");
        $col.append($elem);
        $row.append($col);
      }
    }, function(err, nrows) {
      $lists.append($row);
    });
  });
}

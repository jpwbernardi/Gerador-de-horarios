// https://github.com/mapbox/node-sqlite3/wiki/API
const db = nodeRequire("electron").remote.getGlobal('db');
const objects = nodeRequire("./objects");
var autocompleteOptions = {
  minLength: 0,
  // autoFocus: true, // automatically focus the first item in result list
  source: function(request, response) {
    var results = [];
    var $this = $(this.element[0]);
    var obj = $this.attr("object");
    var thisObj = $this.attr("this-object");
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
    var query = "select ";
    var fields = thisObj.selectFields,
      table = thisObj.table,
      params = [],
      group = thisObj.orderBy,
      order = thisObj.groupBy;
    if (typeof fields !== typeof undefined && fields.length > 0) {
      query += thisObj.fields[fields[0]];
      for (let i = 1; i < fields.length; i++)
        query += ", " + thisObj.fields[fields[i]];
    } else query += "*";
    query += " from " + table;
    if (typeof group !== typeof undefined && group !== "") query += " group by " + group;
    if (typeof order !== typeof undefined && order !== "") query += " order by " + order;
    console.log("LOG_INFO: " + query);
    db.each(query, params, function(err, row) {
      var keys = Object.keys(row);
      var pk = row[keys[0]],
        label = "";
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
          target: $this.attr("target"),
          value: label
        });
    }, function(err, nrows) {
      response(results);
    });
  },
  select: function(event, ui) {
    document.getElementById(ui.item.target).value = ui.item.id;
  }
};

$(document).ready(function() {
  buildForms();
  $(".autocomplete").autocomplete(autocompleteOptions);
  // listRestrictions();
});

function $createElement(tag, attributes, events) {
  var $element = $(document.createElement(tag));
  if (typeof attributes != typeof undefined) {
    $.each(attributes, function(key, value) {
      $element.attr(key, value);
    });
  }
  if (typeof events != typeof undefined) {
    $.each(events, function(key, value) {
      $element[0].addEventListener(key, value);
    });
  }
  return $element;
}

function $createTextualElement(tag, attributes, content) {
  var $element = $(document.createElement(tag));
  $.each(attributes, function(key, value) {
    $element.attr(key, value);
  });
  $element.append(document.createTextNode(content));
  return $element;
}

function getForeignObjects(obj) {
  var keys = [];
  $.each(obj.primaryKey, function(i, field) {
    if (obj.fieldTypes[field] === objects.FIELD_TYPE_FK)
      $.each(getForeignObjects(obj.foreignKeys[field]), function(j, fobj) {
        keys.push(fobj);
      });
    else keys.push(obj);
  });
  return keys;
}

function buildColClasses(obj, findex) {
  var clazz = "";
  if (typeof obj.col !== typeof undefined) {
    if (typeof obj.col["s"] !== typeof undefined && typeof obj.col["s"][findex] != typeof undefined)
      clazz += "s" + obj.col["s"][findex];
    else clazz += "s12 ";
    if (typeof obj.col["m"] !== typeof undefined && typeof obj.col["m"][findex] != typeof undefined)
      clazz += "m" + obj.col["m"][findex];
    else clazz += "m6 ";
    if (typeof obj.col["l"] !== typeof undefined && typeof obj.col["l"][findex] != typeof undefined)
      clazz += "l" + obj.col["l"][findex];
    else clazz += "l3";
  } else clazz = "s12 m6 l3";
  return clazz;
}

function decodeType(obj, findex) {
  switch (obj.fieldTypes[findex]) {
    case objects.FIELD_TYPE_TEXT:
      return "text";
    case objects.FIELD_TYPE_NUMBER:
      return "number";
    case objects.FIELD_TYPE_BOOLEAN:
      return "checkbox";
    default:
      console.log("LOG_WARN: unknown type '" + obj.fieldTypes[findex] + "'");
      return "";
  }
}

function buildForms() {
  var $forms = $(".form");
  $forms.each(function(index, form) {
    var o = form.getAttribute("object");
    var obj = objects[o];
    if (typeof obj !== typeof undefined)
      $(form).append($buildForm(obj));
    else
      console.log("LOG_ERR: object " + o + " not found!");
  });
}

function $buildForm(obj) {
  var i = 0;
  var $row = $createElement("div", {
    "class": "row"
  });
  $.each(obj.fieldTypes, function(j, type) {
    var $col = null;
    if (type === objects.FIELD_TYPE_FK) {
      let fobj = obj.foreignKeys[j];
      let fobjs = getForeignObjects(fobj);
      $.each(fobjs, function(k, fo) {
        var autocomplete = fo.autocomplete;
        if (typeof autocomplete === typeof undefined) {
          autocomplete = [];
          $.each(fo.primaryKey, function(l, key) {
            autocomplete.push({
              "key": key,
              "value": key
            });
          });
        }
        $.each(autocomplete, function(l, f) {
          $col = $createElement("div", {
            "class": "input-field col"
          });
          $col.append($createElement("input", {
            "type": decodeType(fo, f.key),
            "id": fo.table + "-" + fo.fields[f.key] + "-id",
            "table": obj.table,
            "from": fo.table + "-" + fo.fields[f.value],
            "value": "",
            "hidden": "hidden"
          }));
          $col.append($createElement("input", {
            "type": decodeType(fo, f.value),
            "id": fo.table + "-" + fo.fields[f.value],
            "class": "autocomplete validate",
            "title": fo.titles[f.value],
            "target": fo.table + "-" + fo.fields[f.key] + "-id",
            "object": fobj.name,
            "this-object": fo.name
          }));
          $col.append($createTextualElement("label", {
            "for": fo.fields[f.value],
            "title": fo.titles[f.value]
          }, fo.titles[f.value]));
          $col.addClass(buildColClasses(fo, f.value));
          $row.append($col);
        });
      });
    } else {
      $col = $createElement("div", {
        "class": "input-field col"
      });
      var $input = $createElement("input");
      $input.attr("type", decodeType(obj, j));
      $input.attr("id", obj.fields[i]);
      if (type === objects.FIELD_TYPE_BOOLEAN) $input.attr("class", "filled-in");
      $input.attr("title", obj.titles[i]);
      var $label = $createTextualElement("label", {
        "for": obj.fields[i],
        "title": obj.titles[i]
      }, obj.titles[i]);
      $col.addClass(buildColClasses(obj, i));
      $col.append($input);
      $col.append($label);
      $row.append($col);
      i++;
    }
  });
  return $row;
}

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

// $(".autocomplete").autocomplete({
//   minLength: 0,
//   // autoFocus: true, // automatically focus the first item in result list
//   source: function(request, response) {
//     var results = [];
//     var $this = $(this.element[0]);
//     var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
//     var query = "select ";
//     var fields = $this.attr("select-fields"),
//       table = $this.attr("select-from"),
//       whereFrom = $this.attr("select-where-from"),
//       whereField = $this.attr("select-where-field"),
//       whereValue = "",
//       params = [],
//       group = $this.attr("select-group-by"),
//       order = $this.attr("select-order-by");
//     if (typeof fields !== typeof undefined && fields !== "") {
//       fields = fields.split(" ");
//       query += fields[0];
//       for (let i = 1; i < fields.length; i++)
//         query += ", " + fields[i];
//     } else query += "*";
//     query += " from " + table;
//     if (typeof whereFrom !== typeof undefined && whereFrom !== "") {
//       let $whereFrom = $("#" + whereFrom);
//       whereValue = $("#" + whereFrom + "Id").val();
//       if (typeof whereValue !== typeof undefined && whereValue !== "") {
//         query += " where " + whereField + " = :" + whereField;
//         params.push(whereValue);
//       } else {
//         $whereFrom.addClass("invalid");
//         Materialize.toast("Selecione o " + $whereFrom.attr("title").toLowerCase() + " primeiro!", 2000);
//         response();
//         return;
//       }
//     }
//     if (typeof group !== typeof undefined && group !== "") query += " group by " + group;
//     if (typeof order !== typeof undefined && order !== "") query += " order by " + order;
//     console.log("LOG_INFO: " + query);
//     db.each(query, params, function(err, row) {
//       var keys = Object.keys(row);
//       var pk = row[keys[0]],
//         label = "";
//       if (keys.length === 1)
//         label = row[keys[0]];
//       else {
//         label += row[keys[1]];
//         for (let i = 2; i < keys.length; i++)
//           label += " " + row[keys[i]];
//         label += " (" + pk + ")";
//       }
//       if (matcher.test(label))
//         results.push({
//           id: pk,
//           target: $this.attr("target"),
//           value: label
//         });
//     }, function(err, nrows) {
//       response(results);
//     });
//   },
//   select: function(event, ui) {
//     document.getElementById(ui.item.target).value = ui.item.id;
//   }
// });

// Why doesn't work?
// $(".combo-caret").click(function(event) {
//   $("#" + event.currentTarget.getAttribute("target")).autocomplete("search", "");
// });

$(".autocomplete").change(function(event) {
  if (event.currentTarget.value === "") {
    $("#" + event.currentTarget.getAttribute("target")).val("");
  }
});

$(".form-save").click(function(event) {
  var i;
  var table = event.currentTarget.getAttribute("table");
  var elems = $("." + table);
  var correct = true;
  for (i = 0; i < elems.length; i++) {
    if (elems[i].value === "") {
      var $fromElem = $("#" + elems[i].getAttribute("from"));
      $fromElem.addClass("invalid");
      Materialize.toast("O campo '" + $fromElem.attr("title").toLowerCase() + "' é obrigatório", 2000);
      correct = false;
    }
  }
  if (correct) {
    let params = [null, elems[0].value];
    let query = "insert into " + table + " values (?, ?";
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

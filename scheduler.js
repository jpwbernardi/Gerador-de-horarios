// Global js for the project, *add it to every page*

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
// https://github.com/mapbox/node-sqlite3/wiki/API

const db = nodeRequire("electron").remote.getGlobal('db');
const objects = nodeRequire("./objects");
var autocompleteOptions = {
  minLength: 0,
  // autoFocus: true, // automatically focus the first item in result list
  source: function(request, response) {
    var results = [];
    var $this = $(this.element[0]);
    var obj = objects[$this.attr("object")];
    var ownerObj = objects[$this.attr("owner-object")];
    var matcher = new RegExp($.ui.autocomplete.escapeRegex(request.term), "i");
    var params = [];
    var query = "select * from " + ownerObj.table;
    if (typeof ownerObj.groupBy !== typeof undefined && ownerObj.groupBy.length > 0)
      query += " group by " + groupBy(ownerObj.groupBy);
    if (typeof ownerObj.orderBy !== typeof undefined && ownerObj.orderBy.length > 0)
      query += " order by " + orderBy(ownerObj.orderBy.fields, ownerObj.orderBy.types);
    console.log("LOG_INFO[autocompleteOptions, 1]: " + query);
    db.each(query, params, function(err, row) {
      var keys = undefined;
      if (typeof ownerObj.selectFields !== typeof undefined && ownerObj.selectFields.length > 0) {
        keys = [ownerObj.fields[ownerObj.selectFields[0]]];
        for (let i = 1; i < ownerObj.selectFields.length; i++)
          keys.push(ownerObj.fields[ownerObj.selectFields[i]]);
      } else {
        keys = Object.keys(row); // all fields from the 'select *'
      }
      var label = row[keys[0]];
      for (let i = 1; i < keys.length; i++)
        label += ", " + row[keys[i]];
      if (matcher.test(label)) {
        let rowJson = {
          "label": label,
          "pk": {}
        };
        $.each(ownerObj.primaryKey, function(i, key) {
          rowJson.pk[ownerObj.table + "-" + ownerObj.fields[key] + "-id"] = row[ownerObj.fields[key]];
        });
        results.push(rowJson);
      }
    }, function(err, nrows) {
      response(results);
    });
  },
  select: function(event, ui) {
    $.each(ui.item.pk, function(key, value) {
      document.getElementById(key).value = value;
    });
  }
};

$(".button-collapse").sideNav();
$(".autocomplete").autocomplete(autocompleteOptions);
$(".autocomplete").change(function(event) {
  if (event.currentTarget.value === "") {
    var obj = objects[event.currentTarget.getAttribute("object")];
    $.each(obj.primaryKey, function(i, key) {
      $("#" + obj.table + "-" + obj.fields[key] + "-id").val("");
    });
  }
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
  $element.append(content);
  return $element;
}

function buildColClasses(obj, findex) {
  var clazz = "";
  if (typeof obj.col !== typeof undefined) {
    if (typeof obj.col["s"] !== typeof undefined && typeof obj.col["s"][findex] != typeof undefined)
      clazz += "s" + obj.col["s"][findex];
    else clazz += "s12";
    clazz += " ";
    if (typeof obj.col["m"] !== typeof undefined && typeof obj.col["m"][findex] != typeof undefined)
      clazz += "m" + obj.col["m"][findex];
    else clazz += "m6";
    clazz += " ";
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
      console.log("LOG_WARN[decodeType, 1]: unknown type '" + obj.fieldTypes[findex] + "'");
      return "";
  }
}

function decodeOrder(type) {
  switch (type) {
    case 1:
      return "asc";
    case -1:
      return "desc";
    default:
      console.log("LOG_WARN[decodeOrder, 1]: unknown order by, type '" + type + "'!");
      return "";
  }
}

function orderBy(fields, types) {
  var order = "";
  var defaultOrder = false;
  if (typeof types !== typeof undefined && types.length > 0) {
    if (fields.length !== types.length)
      throw new RangeError("Ordering type must be specified for every field, if any.");
  } else defaultOrder = true;
  for (let i = 0; i < fields.length; i++)
    order += fields[i] + " " + decodeOrder(defaultOrder === true ? ORDER_TYPE_ASC : types[i]);
  return order;
}

function groupBy(fields) {
  var group = "";
  if (typeof fields !== typeof undefined && fields.length > 0) {
    group = fields[0];
    for (let i = 1; i < fields.length; i++)
      group += ", " + fields[i];
  } else console.log("LOG_WARN[groupBy, 1]: empty 'fields' parameter");
  return group;
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

function buildForms() {
  var $forms = $("form");
  $forms.each(function(index, form) {
    var o = form.getAttribute("object");
    var obj = objects[o];
    if (typeof obj !== typeof undefined)
      $(form).append($buildForm(obj));
    else
      console.log("LOG_ERR[buildForms, 1]: object " + o + " not found!");
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
          let $hiddenInput = $createElement("input", {
            "type": decodeType(fo, f.key),
            "id": fo.table + "-" + fo.fields[f.key] + "-id",
            "object": obj.name,
            "from": fo.table + "-" + fo.fields[f.value],
            "value": "",
            "hidden": "hidden"
          });
          if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
            $hiddenInput.attr("required", "required");
          $col.append($hiddenInput);
          $col.append($createElement("input", {
            "type": decodeType(fo, f.value),
            "id": fo.table + "-" + fo.fields[f.value],
            "class": "autocomplete validate",
            "title": fo.titles[f.value],
            "target": fo.table + "-" + fo.fields[f.key] + "-id",
            "object": fobj.name,
            "owner-object": fo.name
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
      $input.attr("object", obj.name);
      if (type === objects.FIELD_TYPE_BOOLEAN) $input.attr("class", "filled-in");
      $input.attr("title", obj.titles[i]);
      if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
        $input.attr("required", "required");
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
  $col = $createElement("div", {
    "class": "input-field col s4 m2 l1"
  });
  $col.append($createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-save",
    "object": obj.name,
    "title": "Salvar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "save")));
  $row.append($col);
  return $row;
}

$(".form-save").click(function(event) {
  var i;
  var obj = objects[event.currentTarget.getAttribute("object")];
  var elems = $("input[object=" + obj.name + "]");
  var correct = true;
  for (i = 0; i < elems.length; i++) {
    if (elems[i].type !== "checkbox" && elems[i].value === "") {
      var $fromElem = $("#" + elems[i].getAttribute("from"));
      $fromElem.addClass("invalid");
      Materialize.toast("O campo '" + $fromElem.attr("title").toLowerCase() + "' é obrigatório", 2000);
      correct = false;
    }
  }
  if (correct) {
    let params = [elems[0].value];
    let query = "insert into " + obj.table + " values (?";
    for (i = 1; i < elems.length; i++) {
      query += ", ?";
      if (elems[i].type === "checkbox")
        params.push(elems[i].checked);
      else params.push(elems[i].value);
    }
    query += ")";
    console.log("LOG_INFO[.form-save click, 1]: " + query);
    console.log("LOG_INFO[.form-save click, 2]: " + params);
    db.run(query, params, function(err) {
      if (err !== null) {
        console.log("LOG_ERR[.form-save click, 3]: " + err);
        Materialize.toast(err, 3000);
      } else {
        Materialize.toast("Registro salvo com sucesso!", 2000);
        $("form[object=" + obj.name + "]")[0].reset();
      }
    });
  }
});

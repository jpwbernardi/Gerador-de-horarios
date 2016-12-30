// Global js for the project, *add it to every page*

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
// https://github.com/mapbox/node-sqlite3/wiki/API


$(document).ready(function(){
  // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
  $(".modal").modal();
});

const db = nodeRequire("electron").remote.getGlobal('db');
const objects = nodeRequire("./objects");
const colors = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "grey", "blue-grey"];
const colorVariations = ["lighten-3", "darken-3", "accent-1", "accent-2", "accent-3", "accent-4"];
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
    var query = selectAllJoins(obj);
    if (typeof obj.selectWhere !== typeof undefined) {
      let fieldIndex = obj.foreignKey.indexOf(ownerObj);
      if (typeof obj.selectWhere[fieldIndex] !== typeof undefined) {
        if (typeof obj.selectWhere[fieldIndex].object !== typeof undefined && obj.selectWhere[fieldIndex].object.length > 0 && obj.selectWhere[fieldIndex].object.length === obj.selectWhere[fieldIndex].field.length) {
          for (let i = 0; i < obj.selectWhere[fieldIndex].object.length; i++) {
            let whereFieldId = "#" + obj.selectWhere[fieldIndex].object[i].table + "-" + obj.selectWhere[fieldIndex].object[i].fields[obj.selectWhere[fieldIndex].field[i]] + "-id" + $this.attr("index");
            let $whereField = $(whereFieldId);
            if ($whereField.val() === "") {
              let $whereFrom = $("#" + $whereField.attr("from"));
              $whereFrom.addClass("invalid");
              Materialize.toast("Selecione o campo '" + $whereFrom.attr("title") + "' primeiro!", 2000);
              response();
              return;
            }
            query += (i === 0 ? " where " : " and ") + obj.selectWhere[fieldIndex].object[i].fields[obj.selectWhere[fieldIndex].field[i]] + " = ?";
            params.push($whereField.val());
          }
        } else {
          syslog("LOG_ERR", "autocompleteOptions", 4, obj.name + "." + obj.fields[fieldIndex] + " has wrong selectWhere format");
          return;
        }
      } else syslog("LOG_WARN", "autocompleteOptions", 3, obj.name + " has no selectWhere[" + fieldIndex + "]");
    } else syslog("LOG_INFO", "autocompleteOptions", 2, obj.name + " has no selectWhere");
    if (typeof ownerObj.groupBy !== typeof undefined && ownerObj.groupBy.length > 0)
      query += " group by " + groupBy(ownerObj.groupBy);
    if (typeof ownerObj.orderBy !== typeof undefined && ownerObj.orderBy.length > 0)
      query += " order by " + orderBy(ownerObj.orderBy.fields, ownerObj.orderBy.types);
    syslog("LOG_INFO", "autocompleteOptions", 1, query);
    syslog("LOG_INFO", "autocompleteOptions", 5, params);
    db.each(query, params, function(err, row) {
      var keys = autocompleteFields(ownerObj);
      var label = row[keys[0]];
      for (let i = 1; i < keys.length; i++)
        label += ", " + row[keys[i]];
      if (matcher.test(label)) {
        let rowJson = {
          "label": label,
          "pk": {}
        };
        $.each(ownerObj.primaryKey, function(i, pk) {
          if (ownerObj.fieldTypes[pk] === objects.FIELD_TYPE_FK) return true; // continue
          rowJson.pk[ownerObj.table + "-" + ownerObj.fields[pk] + "-id"] = row[ownerObj.fields[pk]];
        });
        syslog("LOG_INFO", "autocompleteOptions", 6, JSON.stringify(rowJson));
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

setTimeout(mainInit, 0);
buildMenu();
$(".button-collapse").sideNav();
buildForm("form");
setTimeout(buildForm, 0, "list");

function mainInit() {
  let vt = document.getElementsByClassName("vertical-text");
  for (let i = 0; i < vt.length; i++) {
    let text = vt[i].innerText;
    text = text.split("").join("\n");
    vt[i].innerText = text;
  }
}

$("main").on("change", ".autocomplete", (event) => {
  if (event.currentTarget.value === "") {
    var obj = objects[event.currentTarget.getAttribute("owner-object")];
    $.each(obj.primaryKey, function(i, key) {
      $("#" + obj.table + "-" + obj.fields[key] + "-id" + event.currentTarget.getAttribute("index")).val("");
    });
  }
});

$("main").on("click", "button.form-delete", (event) => {
  $("#modal-delete").modal("open");
  // we need the original event
  $("#modal-delete-confirm").off("click.delete");
  $("#modal-delete-confirm").on("click.delete", () => {
    deleteRow(event);
  });
});

function deleteObject(object, fields) {
  var error = null;
  var query = valuesWhere(object, fields);
  query.string = "delete from " + object.table + " where " + query.string;
  syslog("LOG_INFO", "deleteObject", 1, query.string);
  syslog("LOG_INFO", "deleteObject", 2, query.params);
  db.run(query.string, query.params, (err) => {
    if (err === null) {
      syslog("LOG_INFO", "deleteObject", 1, "successfully deleted item.");
    } else {
      syslog("LOG_ERR", "deleteObject", 2, err);
      error = err;
    }
  });
  return error;
}

function deleteRow(event) {
  var $target = $(event.currentTarget);
  var $row = $target.closest("div.row");
  var obj = objects[$target.attr("object")];
  var index = typeof $target.attr("index") !== typeof undefined ? $target.attr("index") : "";
  var fields = $("input." + obj.name + index);
  var error = deleteObject(obj, fields);
  if (error === null) {
    $row.remove();
    Materialize.toast("Excluído com sucesso!", 2000);
    syslog("LOG_INFO", ".form-delete click", 1, "successfully deleted item.");
  } else {
    Materialize.toast("Erro na exclusão!", 3000);
    syslog("LOG_ERR", ".form-delete click", 2, err);
  }
}

$("main").on("click", "button.form-save", (event) => {
  var i;
  var correct = true;
  var obj = objects[event.currentTarget.getAttribute("object")];
  var index = event.currentTarget.hasAttribute("index") ? event.currentTarget.getAttribute("index") : "";
  var fields = $("input." + obj.name + index);
  for (i = 0; i < fields.length; i++) {
    var $field = $(fields[i]);
    if (typeof $field.attr("from") !== typeof undefined) $field = $("#" + $field.attr("from"));
    if ($field.attr("required") && $field.val() === "" && $field.attr("type") !== "checkbox") {
      $field.addClass("invalid");
      Materialize.toast("O campo '" + $field.attr("title") + "' é obrigatório", 2000);
      correct = false;
    }
  }
  if (correct) {
    let query = valuesInsert(obj, fields);
    query.string = "insert into " + obj.table + " values (" + query.string + ")";
    syslog("LOG_INFO", ".form-save click", 1, query.string);
    syslog("LOG_INFO", ".form-save click", 2, query.params);
    db.run(query.string, query.params, function(err) {
      if (err !== null) {
        syslog("LOG_ERR", ".form-save click", 3, err);
        Materialize.toast("Este registro já está cadastrado!", 3000);
      } else {
        Materialize.toast("Salvo com sucesso!", 2000);
        // yeah, editing is insert new + delete old...
        if (event.currentTarget.hasAttribute("editing") === true) deleteObject(obj, fields);
        else appendNewRow(obj, fields);
      }
      // remove "editing" attribute here because db.run is non-blocking
      event.currentTarget.removeAttribute("editing");
    });
    if (event.currentTarget.hasAttribute("editing") === true) {
      event.currentTarget.children[0].innerHTML = "edit";
      $(event.currentTarget).addClass("form-edit");
      $(event.currentTarget).removeClass("form-save");
      $.each(fields, (index, field) => {
        if (field.hasAttribute("from")) {
          document.getElementById(field.getAttribute("from")).setAttribute("disabled", "disabled");
        } else {
          field.setAttribute("disabled", "disabled");
        }
      });
    }
  }
});

$("main").on("click", "button.form-edit", (event) => {
  var obj = objects[event.currentTarget.getAttribute("object")];
  var index = event.currentTarget.hasAttribute("index") ? event.currentTarget.getAttribute("index") : "";
  var fields = $("input." + obj.name + index);
  event.currentTarget.setAttribute("editing", "editing");
  event.currentTarget.children[0].innerHTML = "save";
  $(event.currentTarget).addClass("form-save");
  $(event.currentTarget).removeClass("form-edit");
  $.each(fields, (index, field) => {
    if (field.hasAttribute("from")) {
      let $field = $("#" + field.getAttribute("from"));
      $field.removeAttr("disabled");
      // $field.autocomplete(autocompleteOptions);
    } else {
      field.removeAttribute("disabled");
    }
  });
});

function hasPrimaryNotForeign(obj) {
  var has = false;
  $.each(obj.primaryKey, (i, key) => {
    if (obj.fieldTypes[i] !== objects.FIELD_TYPE_FK) {
      has = true;
      return false; // this return is for $.each
    }
  });
  return has;
}

function valuesInsert(obj, fields) {
  var objFields = allOwnFields(obj);
  var query = {
    string: "",
    params: []
  };
  $.each(objFields, (i) => {
    if (i > 0) query.string += ", ";
    query.string += "?";
    query.params.push(valueOf(fields[i]));
  });
  return query;
}

function valuesWhere(obj, fields) {
  var objFields = allPrimaryFields(obj);
  var query = {
    string: "",
    params: []
  };
  $.each(objFields, (i, primaryKey) => {
    if (i > 0) query.string += " and ";
    query.string += primaryKey + " = " + "?";
    $.each(fields, (j, input) => {
      if (input.getAttribute("field") === primaryKey)
        query.params.push(valueOf(input));
    });
  });
  return query;
}

function valueOf(field) {
  if (field.type === "checkbox") return field.checked;
  return field.value;
}

function objFields(obj, filter) {
  var fields = [];
  var f = 0,
    fk = 0;
  var types = (filter === objects.FILTER_ALL_PRIMARY ? obj.primaryKey : obj.fieldTypes),
    nextFilter = (filter === objects.FILTER_ALL ? objects.FILTER_ALL : objects.FILTER_ALL_PRIMARY);
  $.each(types, (i, type) => {
    if (filter === objects.FILTER_ALL_PRIMARY) {
      if (obj.fieldTypes[type] === objects.FIELD_TYPE_FK)
        fields = fields.concat(objFields(obj.foreignKey[type], nextFilter));
      else fields.push(obj.fields[type]);
    } else {
      if (type === objects.FIELD_TYPE_FK)
        fields = fields.concat(objFields(obj.foreignKey[i], nextFilter));
      else fields.push(obj.fields[f++]);
    }
  });
  return fields;
}

function allPrimaryFields(obj) {
  return objFields(obj, objects.FILTER_ALL_PRIMARY);
}

function allOwnFields(obj) {
  return objFields(obj, objects.FILTER_ALL_OWN);
}

function allFields(obj) {
  return objFields(obj, objects.FILTER_ALL);
}

function selectAll(obj) {
  return "select " + allFields(obj).join(", ") + " from " + obj.table;
}

function selectAllJoins(obj) {
  var query = selectAll(obj);
  $.each(getForeignObjects(obj), function(i, fobj) {
    query += " natural join " + fobj.table;
  });
  return query;
}

function foreignPrimaryKeys(obj, visited) {
  var fpks = [];
  $.each(obj.primaryKey, function(i, pk) {
    if (obj.fieldTypes[pk] === objects.FIELD_TYPE_FK && typeof visited[obj.foreignKey[pk]] === typeof undefined) {
      fpks.push(obj.foreignKey[pk]);
    }
  });
  return fpks;
}

function getForeignPrimaryObjects(o) {
  var visited = {};
  var queue = foreignPrimaryKeys(o, visited);
  var fobjs = [], front = 0, back = queue.length - 1;
  while (front <= back) {
    let obj = queue[front++];
    visited[obj] = true;
    fobjs.push(obj);
    let fpks = foreignPrimaryKeys(obj, visited);
    back += fpks.length;
    queue = queue.concat(fpks);
  }
  return fobjs;
}

function getForeignObjects(o) {
  var queue = o.foreignKey || [];
  var visited = {};
  var fobjs = [],
    front = 0,
    back = queue.length - 1;
  while (front <= back) {
    let obj = queue[front++];
    if (typeof obj === typeof undefined) continue;
    visited[obj] = true;
    fobjs.push(obj);
    $.each(obj.foreignKey, (i, fk) => {
      if (typeof visited[fk] === typeof undefined) {
        queue.push(fk);
        back++;
      }
    });
  }
  return fobjs;
}

function autocompleteFields(obj) {
  var fields = [];
  if (typeof obj !== typeof undefined) {
    if (typeof obj.selectFields !== typeof undefined && obj.selectFields.length > 0) {
      for (let i = 0; i < obj.selectFields.length; i++)
        fields.push(obj.fields[obj.selectFields[i]]);
    } else {
      fields = obj.fields; // all fields from the 'select *'
    }
  } else syslog("LOG_WARN", "autocompleteFields", 1, "obj is undefined!");
  return fields;
}

function $createElement(tag, attributes, events) {
  var $element = $(document.createElement(tag));
  if (typeof attributes != typeof undefined) {
    $.each(attributes, function(key, value) {
      $element.attr(key, value);
    });
  }
  if (typeof events != typeof undefined) {
    $.each(events, function(key, value) {
      console.log(key, value);
      $element.on(key, value);
      // $element[0].addEventListener(key, value);
    });
  }
  return $element;
}

function $createTextualElement(tag, attributes, content, events) {
  var $element = $createElement(tag, attributes, events);
  if (typeof content !== typeof undefined)
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
    // case objects.FIELD_TYPE_FK:
    //   return "fk";
    default:
      syslog("LOG_WARN" , "decodeType", 1 , "unknown type '" + obj.fieldTypes[findex] + "', index " + findex + " on " + obj.name);
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
      syslog("LOG_WARN", "decodeOrder", 1, "unknown order by, type '" + type + "'!");
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
  } else syslog("LOG_WARN", "groupBy", 1, "empty 'fields' parameter");
  return group;
}

function buildMenu() {
  var $wrapper = $createElement("div", {
    "class": "nav-wrapper container"
  });
  $wrapper.append($createTextualElement("a", {
    "href": "index.html",
    "class": "brand-logo"
  }, "Gerador de horários"));

  var $a = $createElement("a", {
    "href": "#",
    "data-activates": "swipebar",
    "class": "button-collapse"
  });
  $a.append($createTextualElement("i", {
    "class": "material-icons"
  }, "menu"));
  $wrapper.append($a);

  var $ul = $createElement("ul", {
    "class": "right hide-on-med-and-down"
  });
  buttons($ul);
  $wrapper.append($ul);

  $ul = $createElement("ul", {
    "class": "side-nav",
    "id": "swipebar"
  })
  buttons($ul);
  $wrapper.append($ul);

  var $nav = $createElement("nav", {
    "class": "marbot-25px teal darken-3"
  });
  $nav.append($wrapper);
  $(".sch-menu").append($nav);
}

function buttons($ul) {
  var $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "index.html"
  }, "Grade"));
  $ul.append($item);

  $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "restrictions.html"
  }, "Restrições"));
  $ul.append($item);

  $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "professor.html"
  }, "Professores"));
  $ul.append($item);

  $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "ccr.html"
  }, "CCRs"));
  $ul.append($item);

  $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "assoc.html"
  }, "Associações"));
  $ul.append($item);

  $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "help.html"
  }, "Ajuda"));
  $ul.append($item);
}

function buildForm(clazz) {
  var $elems = $("div." + clazz);
  $elems.each(function(index, elem) {
    var o = elem.getAttribute("object");
    var obj = objects[o];
    if (typeof obj !== typeof undefined) {
      $(elem).append($buildForm(obj, clazz));
    } else {
      syslog("LOG_ERR", "buildForm('" + clazz + "')", 1, "object " + o + " not found!");
    }
  });
}

function $buildForm(obj, clazz) {
  var $form = $createElement("div");
  if (clazz === "form") {
    $form.append($buildFormRow(obj));
  } else if (clazz === "list") {
    let rownum = 0;
    let query = selectAllJoins(obj);
    db.each(query, function(err, row) {
      if (err === null)
        setTimeout(function(rownum) {
          $form.append($buildListRow(obj, row, rownum));
        }, 0, rownum++);
      else syslog("LOG_ERR", "$buildForm", 1, "error fetching " + obj.table + " rows.");
    }, (err, nrows) => {
      if (err === null) syslog("LOG_INFO", "$buildForm", 2, "done loading " + nrows + " row(s).");
      else syslog("LOG_ERR", "$buildForm", 3, err);
    });
  }
  return $form;
}

function $buildFormRow(obj) {
  var $row = $buildRow(obj, new obj, "");
  var $col = $createElement("div", {
    "class": "input-field col s4 m2 l2"
  });
  var $button = $createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-save",
    "object": obj.name,
    "title": "Salvar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "save"));
  $col.append($button);
  $row.append($col);
  return $row;
}

function $buildListRow(obj, tuple, rownum) {
  var $row = $buildRow(obj, tuple, rownum);
  var $col = $createElement("div", {
    "class": "input-field col s4 m2 l2"
  });
  // $button = $createTextualElement("button", {
  //   "class": "btn btn-short waves-effect waves-light form-edit",
  //   "object": obj.name,
  //   "index": rownum,
  //   "title": "Editar"
  // }, $createTextualElement("i", {
  //   "class": "material-icons"
  // }, "edit"));
  // $col.append($button);
  $button = $createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-delete",
    "object": obj.name,
    "index": rownum,
    "title": "Deletar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "delete"));
  $col.append($button);
  $row.append($col);
  return $row;
}

function appendNewRow(obj, fields) {
  var lastRow = -Infinity;
  var rownums = $("div.row").map(function() {
    return this.getAttribute("index");
  });
  rownums.each((i, num) => {
    if (num > lastRow) lastRow = num;
  });
  var query = valuesWhere(obj, fields);
  query.string = selectAllJoins(obj) + " where " + query.string;
  syslog("LOG_INFO","appendNewRow", 1,  query.string);
  syslog("LOG_INFO","appendNewRow", 2, query.params);
  db.get(query.string, query.params, (err, tuple) => {
    if (err === null) {
      if (typeof tuple !== typeof undefined) {
        $("div.list[object=" + obj.name + "]").append($buildListRow(obj, tuple, lastRow + 1));
        let $inputs = $("div.form[object=" + obj.name + "]").find("input");
        $inputs.val("");
        $inputs.filter(":visible:first").focus();
      } else syslog("LOG_ERR", "appendNewRow", 4, "tuple is undefined.");
    } else syslog("LOG_ERR", "appendNewRow", 3, err);
  });
}

function $buildRow(obj, tuple, rownum) {
  var i = 0;
  var $row = $createElement("div", {
    "class": "row"
  });
  if (rownum !== "") $row.attr("index", rownum);
  $.each(obj.fieldTypes, function(j, type) {
    var $col = null,
      $input = null;
    if (type === objects.FIELD_TYPE_FK) {
      let fobj = obj.foreignKey[j], fobjs = hasPrimaryNotForeign(fobj) ? [fobj] : [];
      fobjs = fobjs.concat(getForeignPrimaryObjects(fobj));
      $.each(fobjs, function(k, fo) {
        $col = $createElement("div", {
          "class": "input-field col"
        });
        $.each(fo.primaryKey, function(l, pk) {
          if (fo.fieldTypes[pk] === objects.FIELD_TYPE_FK) return true; // continue
          $input = $createElement("input", {
            "type": decodeType(fo, pk),
            "id": fo.table + "-" + fo.fields[pk] + "-id" + rownum,
            "class": obj.name + rownum,
            "object": obj.name,
            "field": fo.fields[pk],
            "from": obj.table + "-" + fo.table + rownum,
            "value": tuple[fo.fields[pk]],
            "hidden": "hidden"
          });
        });
        $col.append($input);
        let autocompleteValue = "";
        if (rownum !== "") {
          let afs = autocompleteFields(fo);
          $.each(afs, function(i, af) {
            if (i > 0) autocompleteValue += ", ";
            autocompleteValue += tuple[af];
          });
        }
        $input = $createElement("input", {
          "type": "text",
          "id": obj.table + "-" + fo.table + rownum,
          "class": "autocomplete validate",
          "title": fo.titles[fo.foreignTitle],
          "object": fobj.name,
          "owner-object": fo.name,
          "index": rownum,
          "value": autocompleteValue
        });
        if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
          $input.attr("required", "required");
        if ($input.val() !== "") $input.attr("disabled", "disabled");
        $input.autocomplete(autocompleteOptions);
        $col.append($input);
        $col.append($createTextualElement("label", {
          "for": obj.table + "-" + fo.table + rownum,
          "title": fo.titles[fo.foreignTitle],
          "class": $input.val() === "" ? "" : "active"
        }, fo.titles[fo.foreignTitle]));
        $col.addClass(buildColClasses(fo, fo.foreignTitle));
        $row.append($col);
      });
    } else {
      $col = $createElement("div", {
        "class": "input-field col"
      });
      $input = $createElement("input");
      $input.attr("type", decodeType(obj, j));
      $input.attr("id", obj.table + "-" + obj.fields[i] + rownum);
      $input.attr("class", obj.name + rownum);
      $input.attr("object", obj.name);
      $input.attr("field", obj.fields[i]);
      $input.attr("value", tuple[obj.fields[i]]);
      $input.attr("title", obj.titles[i]);
      if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
        $input.attr("required", "required");
      if (typeof tuple[obj.fields[i]] !== typeof undefined)
        $input.attr("disabled", "disabled");
      var $label = $createTextualElement("label", {
        "for": obj.table + "-" + obj.fields[i] + rownum,
        "title": obj.titles[i]
      }, obj.titles[i]);
      if (type === objects.FIELD_TYPE_BOOLEAN) {
        $input.addClass("filled-in");
        if (tuple[obj.fields[i]] === 1 || rownum === "")
          $input.attr("checked", "checked");
      } else if ($input.val() !== "") {
        $label.addClass("active");
      }
      $col.addClass(buildColClasses(obj, i));
      $col.append($input);
      $col.append($label);
      $row.append($col);
      i++;
    }
  });
  return $row;
}

function syslog(level, functionName, code, message) {
  console.log(level, functionName, code, message);
}

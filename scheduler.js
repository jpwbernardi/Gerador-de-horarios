// Global js for the project, *add it to every page*

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect
// https://github.com/mapbox/node-sqlite3/wiki/API

const nameLen = 16;
const objects = require("./objects");
const electron = require("electron");
const db = electron.remote.getGlobal('db');
const ClassList = require("./ClassList.js");
const LOG_LEVEL = electron.remote.getGlobal("LOG_LEVEL");
const LOG_LEVEL_STRING = electron.remote.getGlobal("LOG_LEVEL_STRING");
const colorVariations = ["lighten-3", "darken-3", "accent-1", "accent-2", "accent-3", "accent-4"];
const colors = ["red", "pink", "purple", "deep-purple", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "deep-orange", "brown", "grey", "blue-grey"];
const autocompleteOptions = {
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
          syslog(LOG_LEVEL.E, "autocompleteOptions", 4, obj.name + "." + obj.fields[fieldIndex] + " has wrong selectWhere format");
          return;
        }
      } else syslog(LOG_LEVEL.W, "autocompleteOptions", 3, obj.name + " has no selectWhere[" + fieldIndex + "]");
    } else syslog(LOG_LEVEL.I, "autocompleteOptions", 2, obj.name + " has no selectWhere");
    if (typeof ownerObj.groupBy !== typeof undefined && ownerObj.groupBy.length > 0)
      query += " group by " + groupBy(ownerObj.groupBy);
    if (typeof ownerObj.orderBy !== typeof undefined)
      query += " order by " + orderBy(ownerObj.orderBy.fields, ownerObj.orderBy.types);
    syslog(LOG_LEVEL.I, "autocompleteOptions", 1, query);
    syslog(LOG_LEVEL.I, "autocompleteOptions", 5, params);
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
        syslog(LOG_LEVEL.I, "autocompleteOptions", 6, JSON.stringify(rowJson));
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
buildForm("form");
setTimeout(buildForm, 0, "list");

$(".modal").modal();
$(".button-collapse").sideNav();

function syslog(logLevel, functionName, code, message) {
  console.log(LOG_LEVEL_STRING[logLevel] + ": " + message, "(code " + code + " at " + functionName + ")");
}

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

function rollbackIfErr(err, message) {
  if (err !== null) {
    syslog(LOG_LEVEL.E, message, 1, err);
    db.exec("ROLLBACK", (err) => {
      if (err !== null) syslog(LOG_LEVEL.E, "rollbackIfErr ROLLBACK", 2, err);
    });
    Materialize.toast("Ocorreu um erro! Recarregando...", 2000);
    setTimeout(() => {
     electron.ipcRenderer.send("window.reload");
    }, 2000);
  }
}

function beginTransaction() {
  db.exec("BEGIN IMMEDIATE", (err) => {
    rollbackIfErr(err, "beginTransaction");
  });
}

function commitTransaction() {
  db.exec("COMMIT", (err) => {
    rollbackIfErr(err, "commitTransaction");
  });
}

function classListRemove(blockNumber, counter, shouldUseTransaction, $target, object) {
  if (shouldUseTransaction === true) beginTransaction();
  db.run("with del(next) as (select next from class where counter = ?)"
    + " update class_list set head = (select next from del) where head = ? and blockNumber = ?", [counter, counter, blockNumber], (err) => {
    rollbackIfErr(err, "classListRemove head update");
  });

  db.run("with del(prev) as (select prev from class where counter = ?)"
    + " update class_list set tail = (select prev from del) where tail = ? and blockNumber = ?", [counter, counter, blockNumber], (err) => {
    rollbackIfErr(err, "classListRemove tail update");
  });

  db.run("with del(prev, next) as (select prev, next from class where counter = ?)"
    + " update class set next = (select next from del) where counter = (select prev from del)", [counter], (err) => {
     rollbackIfErr(err, "classListRemove prev next update");
  });

  db.run("with del(prev, next) as (select prev, next from class where counter = ?)"
    + " update class set prev = (select prev from del) where counter = (select next from del)", [counter], (err) => {
    rollbackIfErr(err, "classListRemove next prev update");
  });

  db.run("delete from class where counter = ?", [counter], (err) => {
    rollbackIfErr(err, "classListRemove delete");
  });

  db.run("update class_list set length = length - 1 where blockNumber = ?", [blockNumber], (err) => {
    if (err === null) {
      if (shouldUseTransaction === true) commitTransaction();
      else if (typeof $target !== typeof undefined && typeof object !== typeof undefined) actualDelete($target, object);
    } else {
      rollbackIfErr(event, err, "classListRemove length update");
    }
  });
}

function getField(fields, desiredFieldName) {
  for (let i = 0; i < fields.length; i++) {
    let $field = $(fields[i]);
    if ($field.attr("field") === desiredFieldName) return $field;
  }
  return null;
}

function deleteRow(event) {
  let $target = $(event.currentTarget);
  let object = objects[$target.attr("object")];
  let index = $target.attr("index");
  let fields = $("input." + object.name + index);
  let classQuery = {
    string: "select * from class",
    params: null
  }
  if (object === objects["Professor"] || object === objects["Subject"] || object === objects["ProfessorSubject"]) {
    beginTransaction();
    if (object === objects["Professor"]) {
      classQuery.string += " where siape = ?";
      classQuery.params = [valueOf(getField(fields, "siape"))];
    } else if (object === objects["Subject"]) {
      classQuery.string += " where code = ?";
      classQuery.params = [valueOf(getField(fields, "code"))];
    } else { // } else if (object === objects["ProfessorSubject"]) {
      classQuery.string += " where siape = ? and code = ?";
      classQuery.params = [valueOf(getField(fields, "siape")), valueOf(getField(fields, "code"))];
    }
    db.each(classQuery.string, classQuery.params, (err, row) => {
      classListRemove(row.blockNumber, row.counter, false, $target, object);
    }, (err, nrows) => {
      if (err !== null) syslog(LOG_LEVEL.E, "deleteRow", 1, err);
    });
  } else {
    actualDelete($target, object);
  }
}

function actualDelete($target, object) {
  let $row = $target.closest("div.row");
  let index = typeof $target.attr("index") !== typeof undefined ? $target.attr("index") : "";
  let fields = $("input." + object.name + index);
  let query = valuesWhere(object, fields);
  query.string = "delete from " + object.table + " where " + query.string;
  syslog(LOG_LEVEL.D, "actualDelete", 1, query.string);
  syslog(LOG_LEVEL.D, "actualDelete", 2, query.params);
  db.run(query.string, query.params, (err) => {
    if (err === null) {
      $row.remove();
      commitTransaction();
      Materialize.toast("Excluído com sucesso!", 2000);
      syslog(LOG_LEVEL.D, "actualDelete", 3, "successfully deleted item");
    } else {
      Materialize.toast("Erro na exclusão!", 3000);
      syslog(LOG_LEVEL.E, "actualDelete", 4, err);
    }
  });
}

$("main").on("click", "button.form-save", saveForm);

function saveForm(event) {
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
    // yeah, editable is delete old + insert new ...
    let editable = event.currentTarget.hasAttribute("editable") === true;
    if (editable) deleteRow(obj, fields);
    let query = valuesInsert(obj, fields);
    query.string = "insert into " + obj.table + " values (" + query.string + ")";
    syslog(LOG_LEVEL.I, ".form-save click", 1, query.string);
    syslog(LOG_LEVEL.I, ".form-save click", 2, query.params);
    db.run(query.string, query.params, function(err) {
      if (err !== null) {
        syslog(LOG_LEVEL.E, ".form-save click", 3, err);
        Materialize.toast("Este registro já está cadastrado!", 3000);
      } else {
        if (!editable) {
          Materialize.toast("Salvo com sucesso!", 2000);
          appendNewRow(obj, fields);
        }
      }
    });
  }
}

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
  if (field instanceof jQuery) {
    return field.val();
  } else {
    if (field.type === "checkbox") return field.checked;
    return field.value;
  }
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
  var fobjs = [],
    front = 0,
    back = queue.length - 1;
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
  } else syslog(LOG_LEVEL.W, "autocompleteFields", 1, "obj is undefined!");
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
      syslog(LOG_LEVEL.W, "decodeType", 1, "unknown type '" + obj.fieldTypes[findex] + "', index " + findex + " on " + obj.name);
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
      syslog(LOG_LEVEL.W, "decodeOrder", 1, "unknown order by, type '" + type + "'!");
      return "";
  }
}

function orderBy(fields, types) {
  var order = "";
  var defaultOrder = false;
  if (typeof types !== typeof undefined && types.length > 0) {
    if (fields.length !== types.length)
      throw new RangeError("Ordering type must be specified for every field, if any");
  } else defaultOrder = true;
  order += fields[0] + " " + decodeOrder(defaultOrder === true ? objects.ORDER_TYPE_ASC : types[0]);
  for (let i = 1; i < fields.length; i++)
    order += ", " + fields[i] + " " + decodeOrder(defaultOrder === true ? objects.ORDER_TYPE_ASC : types[i]);
  return order;
}

function groupBy(fields) {
  var group = "";
  if (typeof fields !== typeof undefined && fields.length > 0) {
    group = fields[0];
    for (let i = 1; i < fields.length; i++)
      group += ", " + fields[i];
  } else syslog(LOG_LEVEL.W, "groupBy", 1, "empty 'fields' parameter");
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
      syslog(LOG_LEVEL.E, "buildForm('" + clazz + "')", 1, "object " + o + " not found!");
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
    if (typeof obj.orderBy !== typeof undefined)
      query += " order by " + orderBy(obj.orderBy.fields, obj.orderBy.types);
    db.each(query, function(err, row) {
      if (err === null)
        setTimeout(function(rownum) {
          $form.append($buildListRow(obj, row, rownum));
        }, 0, rownum++);
      else syslog(LOG_LEVEL.E, "$buildForm", 1, "error fetching " + obj.table + " rows");
    }, (err, nrows) => {
      if (err === null) syslog(LOG_LEVEL.I, "$buildForm", 2, "done loading " + nrows + " row(s)");
      else syslog(LOG_LEVEL.E, "$buildForm", 3, err);
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
  var lastRow = -1;
  var rownums = $("div.row").map(function() {
    return Number(this.getAttribute("index"));
  });
  rownums.each((i, rowNumber) => {
    if (rowNumber > lastRow) lastRow = rowNumber;
  });
  var query = valuesWhere(obj, fields);
  query.string = selectAllJoins(obj) + " where " + query.string;
  syslog(LOG_LEVEL.I, "appendNewRow", 1, query.string);
  syslog(LOG_LEVEL.I, "appendNewRow", 2, query.params);
  db.get(query.string, query.params, (err, tuple) => {
    if (err === null) {
      if (typeof tuple !== typeof undefined) {
        $("div.list[object=" + obj.name + "]").append($buildListRow(obj, tuple, lastRow + 1));
        let $inputs = $("div.form[object=" + obj.name + "]").find("input");
        $inputs.val("");
        $inputs.filter(":visible:first").focus();
      } else syslog(LOG_LEVEL.E, "appendNewRow", 4, "tuple is undefined");
    } else syslog(LOG_LEVEL.E, "appendNewRow", 3, err);
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
      let fobj = obj.foreignKey[j],
        fobjs = hasPrimaryNotForeign(fobj) ? [fobj] : [];
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
      $input.attr("index", rownum);
      $input.attr("title", obj.titles[i]);
      // only on .list forms
      if (rownum !== "") {
        $input.attr("editable", "editable");
        $input.on("change", saveForm);
      }
      if (typeof obj.fieldRequired !== typeof undefined &&
        typeof obj.fieldRequired[j] !== typeof undefined &&
        obj.fieldRequired[j] === true) {
        $input.attr("required", "required");
      }
      // only checkboxes are allowed to be directly updated
      if (typeof tuple[obj.fields[i]] !== typeof undefined && type !== objects.FIELD_TYPE_BOOLEAN)
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

function firstName(fullname) {
  var sep = fullname.indexOf(" ");
  if (sep !== -1) return fullname.substring(0, sep);
  return fullname;
}

function lastName(fullname) {
  var sep = fullname.lastIndexOf(" ");
  if (sep !== -1) return fullname.substring(sep + 1);
  return null;
}

function naming(fullname) {
  if (fullname.length <= nameLen) return fullname;

  var firstname = firstName(fullname);
  if (firstname.length === nameLen || firstname.length + 1 === nameLen) // + 1 por causa do espaço com o sobrenome
    return firstname;
  if (firstname.length > nameLen) return firstname.substring(0, nameLen - 3) + "...";

  var lastname = lastName(fullname);
  if (lastname !== null) {
    var name = firstname + " " + lastname;
    if (name.length <= nameLen) return name;
    return name.substring(0, nameLen - 3) + "...";
  }
  return firstname;
}

function isSameClass(theClass, otherClass, classFilter) {
  if (otherClass.classList.contains(classFilter)
    && theClass.getAttribute("siape") === otherClass.getAttribute("siape")
    && theClass.getAttribute("code") === otherClass.getAttribute("code")
    && theClass.getAttribute("period") === otherClass.getAttribute("period"))
      return true;
  return  false;
}

function without($elements, $el, classFilter) {
  var i;
  for (i = 0; i < $elements.length; i++)
    if (isSameClass($el[0], $elements[i], classFilter)) break;
  if (i < $elements.length) {
    $elements.splice(i, 1);
    return true;
  }
  return false;
}

function addCloseButton($el) {
  // <i class="close material-icons">close</i>
  let $remove = $createTextualElement("i", {
    "class": "close material-icons"
  }, "close");
  $remove.on("click", (event) => {
    var $target = $(event.currentTarget.parentNode.parentNode);
    var $siblings = $($($target[0].parentNode).children());
    $target.addClass("removed");
    without($siblings, $target, "removed");
    adjustHeight($siblings);
    classListRemove(getBlockNumber($target[0]), $target.attr("counter"), true);
  });
  $el.children(".delete-class").append($remove);
}

function $createClass(row, addClose) {
  var color = row.siape % colors.length;
  var variation = row.siape % (colorVariations.length + 1);
  var $class = $createTextualElement("div", {
    "counter": row.counter,
    "sem": row.sem,
    "dow": row.dow,
    "period": row.period,
    "block": row.block,
    "siape": row.siape,
    "code": row.code,
    "blockNumber": row.blockNumber,
    "prev": row.prev,
    "next": row.next,
    "title": row.name + "\n" + row.title + " (" + row.code + ")",
    "class": "chip draggable white-text " + colors[color] + (variation == colorVariations.length ? "" : " " + colorVariations[variation])
  }, "<span class='delete-class'></span>" + naming(row.name) + " - " + row.title);
  if (addClose) addCloseButton($class);
  return $class;
}

function $createSourceClass(row) {
  return $createClass(row, false);
}

function $createAddedClass(row) {
  var $class = $createClass(row, true);
  $class.css("width", "100%");
  $class.css("display", "block");
  return $class;
}

function adjustHeight($elements) {
  if (typeof $elements !== typeof undefined && $elements !== null) {
    var ratio = 100.0 / $elements.length;
    $.each($elements, (index, element) => {
      $(element).css("max-height", ratio);
    });
  } else {
    syslog(LOG_LEVEL.W, "adjustHeight", 1, "Invalid $elements argument");
  }
}

function getBlockNumber(classEl) {
  return classEl.parentNode.getAttribute("blockNumber");
}

function removeClass(classEl) {

}

// function addClass(containerEl, classEl, theElAfter) {
//   let clazz = jsonify(classEl);
//   let container = jsonify(containerEl);
//   let blockNumber = getBlockNumber(classEl);
//   electron.ipcRenderer.send("classList.add", blockNumber, clazz, container, theElAfter !== null ? theElAfter.getAttribute("counter") : null);
// }

electron.ipcRenderer.on("classList.remove", (event, isAllOkay) => {
  if (isAllOkay === false) {
    Materialize.toast("Ocorreu um erro ao remover este horário. Recarregando...", 1000);
  }
});

function jsonify(el) {
  let json = {};
  for (let i = 0; i < el.attributes.length; i++) {
    let attribute = el.attributes[i];
    json[attribute.nodeName] = attribute.nodeValue;
  }
  return json;
}

// function findBlockFrom(classRow) {
//   globalClassLists.forEach((classList, blockNumber) => {
//     let stClassRow = classList.getRowAt(0);
//     if (inSameBlock(classRow, stClassRow)) return blockNumber;
//   });
//   return null;
// }

// function findClassRowAt(blockNumber, classRow) {
//   return globalClassLists[blockNumber].findRow(classRow);
// }

// function findClassRow(classRow) {
//   let blockNumber = findBlockFrom(classRow);
//   if (blockNumber === null) return null;
//   let classIndex = findClassAt(blockNumber, classRow);
//   if (classIndex == null) return null;
//   return {
//     "block": blockNumber,
//     "class": classIndex
//   };
// }

// function addClassTo(target, classEl, siblingEl) {
//   let blockNumber = findBlockFrom(target);
//   globalClassLists[blockNumber].insertRowBefore(classEl, siblingEl);
// }

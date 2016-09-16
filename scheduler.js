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
    var query = selectAllJoins(obj);
    // var query = "select " + allFields(ownerObj.fields) + " from " + obj.table;
    // if (obj !== ownerObj) query += " natural join " + ownerObj.table;
    if (typeof obj.selectWhere !== typeof undefined) {
      let fieldIndex = obj.foreignKeys.indexOf(ownerObj);
      if (typeof obj.selectWhere[fieldIndex] !== typeof undefined) {
        if (typeof obj.selectWhere[fieldIndex].object !== typeof undefined && obj.selectWhere[fieldIndex].object.length > 0 && obj.selectWhere[fieldIndex].object.length === obj.selectWhere[fieldIndex].field.length) {
          for (let i = 0; i < obj.selectWhere[fieldIndex].object.length; i++) {
            let $whereField = $("#" + obj.selectWhere[fieldIndex].object[i].table + "-" + obj.selectWhere[fieldIndex].object[i].fields[obj.selectWhere[fieldIndex].field[i]] + "-id");
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
          console.log("LOG_ERR[autocompleteOptions, 4]: " + obj.name + "." + obj.fields[fieldIndex] + " has wrong selectWhere format");
          return;
        }
      } else console.log("LOG_WARN[autocompleteOptions, 3]: " + obj.name + " has no selectWhere[" + fieldIndex + "]");
    } else console.log("LOG_INFO[autocompleteOptions, 2]: " + obj.name + " has no selectWhere");
    if (typeof ownerObj.groupBy !== typeof undefined && ownerObj.groupBy.length > 0)
      query += " group by " + groupBy(ownerObj.groupBy);
    if (typeof ownerObj.orderBy !== typeof undefined && ownerObj.orderBy.length > 0)
      query += " order by " + orderBy(ownerObj.orderBy.fields, ownerObj.orderBy.types);
    console.log("LOG_INFO[autocompleteOptions, 1]: " + query);
    console.log("LOG_INFO[autocompleteOptions, 5]: " + params);
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
        $.each(ownerObj.primaryKey, function(i, key) {
          rowJson.pk[ownerObj.table + "-" + ownerObj.fields[key] + "-id"] = row[ownerObj.fields[key]];
        });
        console.log("LOG_INFO[autocompleteOptions, 6]: " + JSON.stringify(rowJson));
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

buildMenu();
$(".button-collapse").sideNav();
buildForm("form");
buildForm("list");
// window.setTimeout($(".autocomplete").autocomplete(autocompleteOptions), 2000);
$(".autocomplete").autocomplete(autocompleteOptions);
$(".autocomplete").change(function(event) {
  if (event.currentTarget.value === "") {
    var obj = objects[event.currentTarget.getAttribute("object")];
    $.each(obj.primaryKey, function(i, key) {
      $("#" + obj.table + "-" + obj.fields[key] + "-id").val("");
    });
  }
});

function allFields(obj) {
  var fields = "";
  var f = 0, fk = 0;
  $.each(obj.fieldTypes, function(i, type) {
    if (i > 0) fields += ", ";
    if (type === objects.FIELD_TYPE_FK) fields += allFields(obj.foreignKeys[fk++]);
    else fields += obj.fields[f++];
  });
  return fields;
}

function selectAll(obj) {
  return "select " + allFields(obj) + " from " + obj.table;
}

function selectAllJoins(obj) {
  var query = selectAll(obj);
  $.each(getForeignObjects(obj), function(i, fobj) {
    query += " natural join " + fobj.table;
  });
  return query;
}

function foreignPrimaryKeys(obj, visited) {
  var fk = 0;
  var fpks = [];
  $.each(obj.primaryKey, function(i, pk) {
    if (obj.fieldTypes[pk] === objects.FIELD_TYPE_FK && typeof visited[obj.foreignKeys[fk]] === typeof undefined) {
      fpks.push(obj.foreignKeys[fk++]);
    }
  });
  return fpks;
}

function getForeignObjects(o) {
  var visited = {};
  var fobjs = [], front = 0, back = -1;
  var queue = foreignPrimaryKeys(o, visited);
  back += queue.length;
  while (front <= back) {
    let obj = queue[front++];
    visited[obj] = true;
    fobjs.push(obj);
    let fpk = foreignPrimaryKeys(obj, visited);
    queue = queue.concat(fpk); back += fpk.length;
  }
  return fobjs;
}

function autocompleteFields(obj) {
  var fields = undefined;
  if (typeof obj !== typeof undefined) {
    if (typeof obj.selectFields !== typeof undefined && obj.selectFields.length > 0) {
      fields = [obj.fields[obj.selectFields[0]]];
      for (let i = 1; i < obj.selectFields.length; i++)
        fields.push(obj.fields[obj.selectFields[i]]);
    } else {
      fields = obj.fields; // all fields from the 'select *'
    }
  }
  else console.log("LOG_WARN[autocompleteFields, 1]: obj is undefined!");
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
      $element[0].addEventListener(key, value);
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

  var $nav = $createElement("nav", {"class": "marbot-20px teal darken-3"});
  $nav.append($wrapper);
  $(".sch-menu").append($nav);
}

function buttons($ul) {
  var $item = $createElement("li", {});
  $item.append($createTextualElement("a", {
    "href": "index.html"
  }, "Página inicial"));
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
  }, "CCR"));
  $ul.append($item);
}

function buildForm(clazz) {
  var $elems = $("div." + clazz);
  $elems.each(function(index, elem) {
    var o = elem.getAttribute("object");
    var obj = objects[o];
    if (typeof obj !== typeof undefined)
      $(elem).append($buildForm(obj, clazz));
    else console.log("LOG_ERR[buildForm('" + clazz + "'), 1]: object " + o + " not found!");
  });
}

function $buildForm(obj, clazz) {
  var $form = $createElement("div");
  if (clazz === "form") $form.append($buildFormRow(obj));
  else if (clazz === "list") {
    let i = 0;
    let query = selectAllJoins(obj);
    db.each(query, function(err, row) {
      if (err === null) $form.append($buildListRow(obj, row, i++));
      else console.log("LOG_ERR[$buildForm, 1]: error fectching " + obj.table + " rows.");
    }, function(err, nrows) {
      if (err === null) {
        console.log("LOG_INFO[$buildForm, 2]: done loading " + nrows + " " + obj.table + " rows.");
      }
    });
  }
  return $form;
}

function $buildFormRow(obj) {
  var $row = $buildRow(obj);
  var $col = $createElement("div", {
    "class": "input-field col s4 m2 l2"
  });
  var $button = $createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-save " + obj.name,
    "object": obj.name,
    "title": "Salvar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "save"));
  $col.append($button);
  $row.append($col);
  return $row;
}

function $buildListRow(obj, tuple, i) {
  var $row = $buildRow(obj, tuple, i);
  var $col = $createElement("div", {
    "class": "input-field col s4 m2 l2"
  });
  $button = $createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-edit " + (obj.name + i),
    "object": obj.name,
    "title": "Editar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "edit"));
  $col.append($button);
  $button = $createTextualElement("button", {
    "class": "btn btn-short waves-effect waves-light form-delete " + (obj.name + i),
    "object": obj.name,
    "title": "Deletar"
  }, $createTextualElement("i", {
    "class": "material-icons"
  }, "delete"));
  $col.append($button);
  $row.append($col);
  return $row;
}

function $buildRow(obj, tuple, rownum) {
  var i = 0, _i = 0;
  var loadValue = typeof tuple !== typeof undefined;
  var $row = $createElement("div", {
    "class": "row"
  });
  $.each(obj.fieldTypes, function(j, type) {
    var $col = null, $input = null;
    if (type === objects.FIELD_TYPE_FK) {
      let fobj = obj.foreignKeys[_i];
      let fobjs = getForeignObjects(fobj);
      // if fobjs.length === 0, then fobj has no PK that is also FK
      // which means it should be an autocomplete, instead of
      // being split in many autocompletes
      if (fobjs.length === 0) fobjs.push(fobj);
      $.each(fobjs, function(k, fo) {
        $col = $createElement("div", {
          "class": "input-field col"
        });
        $.each(fo.primaryKey, function(l, pk) {
          $input = $createElement("input", {
            "type": decodeType(fo, fo.fieldTypes[pk]),
            "id": fo.table + "-" + fo.fields[pk] + "-id" + (loadValue ? rownum : ""),
            "class": obj.name + (loadValue ? rownum : ""),
            "object": obj.name,
            "from": obj.table + "-" + fo.table + (loadValue ? rownum : ""),
            "value": loadValue ? tuple[fo.fields[pk]] : "",
            "hidden": "hidden"
          });
        });
        $col.append($input);
        let autocompleteValue = "";
        if (loadValue === true) {
          let afs = autocompleteFields(fo);
          $.each(afs, function(i, af) {
            autocompleteValue += tuple[af];
          });
        }
        $input = $createElement("input", {
          "type": "text",
          "id": obj.table + "-" + fo.table + (loadValue ? rownum : ""),
          "class": "autocomplete validate",
          "title": fo.titles[fo.foreignTitle],
          "object": fobj.name,
          "owner-object": fo.name,
          "value": loadValue ? autocompleteValue : ""
        });
        if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
          $input.attr("required", "required");
        $col.append($input);
        $col.append($createTextualElement("label", {
          "for": obj.table + "-" + fo.table + (loadValue ? rownum : ""),
          "title": fo.titles[fo.foreignTitle],
          "class": $input.val() === "" ? "" : "active"
        }, fo.titles[fo.foreignTitle]));
        $col.addClass(buildColClasses(fo, fo.foreignTitle));
        $row.append($col);
      });
      _i++;
    } else {
      $col = $createElement("div", {
        "class": "input-field col"
      });
      $input = $createElement("input");
      $input.attr("type", decodeType(obj, j));
      $input.attr("id", obj.table + "-" + obj.fields[i] + (loadValue ? rownum : ""));
      $input.attr("class", obj.name + (loadValue ? rownum : ""));
      $input.attr("object", obj.name);
      if (type === objects.FIELD_TYPE_BOOLEAN) {
        $input.addClass("filled-in");
        if (loadValue === false || (loadValue === true && tuple[obj.fields[i]] === 1))
          $input.attr("checked", "checked");
      }
      else if (loadValue === true) $input.attr("value", tuple[obj.fields[i]]);
      $input.attr("title", obj.titles[i]);
      if (typeof obj.fieldRequired !== typeof undefined && typeof obj.fieldRequired[j] !== typeof undefined && obj.fieldRequired[j] === true)
        $input.attr("required", "required");
      var $label = $createTextualElement("label", {
        "for": obj.table + "-" + obj.fields[i],
        "title": obj.titles[i],
        "class": $input.val() !== "" && type !== objects.FIELD_TYPE_BOOLEAN ? "active" : ""
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

$(".form-save").click(function(event) {
  var i;
  var obj = objects[event.currentTarget.getAttribute("object")];
  var elems = $("input." + obj.name);
  var correct = true;
  for (i = 0; i < elems.length; i++) {
    var $elem = $(elems[i]);
    if (typeof $elem.attr("from") !== typeof undefined) $elem = $("#" + $elem.attr("from"));
    if ($elem.attr("required") && $elem.val() === "" && $elem.attr("type") !== "checkbox") {
      $elem.addClass("invalid");
      Materialize.toast("O campo '" + $elem.attr("title") + "' é obrigatório", 2000);
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
        $("div.form[object=" + obj.name + "]").find("input").val("");
      }
    });
  }
});

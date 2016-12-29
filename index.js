const nameLen = 16;
const stepsSettings = {
  headerTag: "h1",
  bodyTag: "section",
  enableAllSteps: true,
  enableKeyNavigation: true,
  enablePagination: false
};
const dragulaSourceOptions = {
  isContainer: function(el) {
    return el.classList.contains("putable");
    // return false; // only elements in drake.containers will be taken into account
  },
  moves: function(el, source, handle, sibling) {
    return el.classList.contains("draggable");
    // return true; // elements are always draggable by default
  },
  // accepts: function(el, target, source, sibling) {
  //   return true; // elements can be dropped in any of the `containers` by default
  // },
  invalid: function(el, handle) {
    return false; // don't prevent any drags from initiating by default
  },
  copy: function (el, source) {
    return source.classList.contains("dragula-source");
  },
  accepts: function (el, target) {
    return !target.classList.contains("dragula-source");
  },
  direction: 'vertical', // Y axis is considered when determining where an element would be dropped
  // copy: true, // elements are moved by default, not copied
  copySortSource: false, // elements in copy-source containers can be reordered
  revertOnSpill: true, // spilling will put the element back where it was dragged from, if this is true
  removeOnSpill: false, // spilling will `.remove` the element, if this is true
  mirrorContainer: document.body, // set the element that gets mirror elements appended
  ignoreInputTextSelection: false // if true, allows users to select input text
}
var drake = dragula(dragulaSourceOptions);
drake.on('drop', function(el, target, source, sibling) {
  var $el = $(el);
  if ($el.children('.delete-class').children().length === 0) {
    // <i class='close material-icons'>close</i>
    $el.children('.delete-class').append($createTextualElement("i", {"class": "close material-icons"}, "close"));
  }
});
drake.on('over', function(el, container, source) {
  var $el = $(el);
  $el.css("width", "100%");
})
buildGrid();

function $buildTimeTable(semester, shift) {
  var i = 0,
    times = 0;
  var $table = $createElement("table", {
      "semester": semester,
      "shift": shift,
      "class": "timetable our-bordered centered"
    }),
    $tsec = $createElement("thead"),
    $tr = $createElement("tr");
  $tr.append($createElement("th", {
    "width": "5%"
  }));
  $tr.append($createElement("th", {
    "width": "5%"
  }));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Segunda-feira"));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Terça-feira"));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Quarta-feira"));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Quinta-feira"));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Sexta-feira"));
  $tr.append($createTextualElement("th", {
    "width": "15%"
  }, "Sábado"));
  $tsec.append($tr);
  $table.append($tsec);
  $tsec = $createElement("tbody");
  times = 5;
  $tr = $createElement("tr");
  if (shift === 1) {
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 5
    }, "Matutino"));
  } else if (shift === 2) {
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 5
    }, "Vespertino"));
  } else {
    times = 4;
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 4
    }, "Noturno"));
  }
  for (var i = 1; i <= times; i++) {
    $tr.append($createTextualElement("td", {}, i + "º"));
    for (var j = 2; j <= 7; j++) {
      $tr.append($createElement("td", {
        "semester": semester,
        "shift": shift,
        "day": j,
        "time": i,
        "class": "putable",
        "style": "padding: 0;"
      }));
    }
    $tsec.append($tr);
    if (i < times) {
      $tr = $createElement("tr");
    }
  }
  $table.append($tsec);
  return $table;
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

function buildClasses(semester, shift) {
  var $row = $createElement("div", {
    "semester": semester,
    "shift": shift,
    "class": "row putable dragula-source"
  });
  var query = {
    string: "select * from professor_subject ps natural join professor p natural join subject s where s.sem = ? and s.period = ?;",
    params: [semester, shift]
  };
  var rowSelector = "div.row.putable[semester=" + semester + "][shift=" + shift + "]";
  db.each(query.string, query.params, function(err, row) {
    let $div = $createTextualElement("div", {
      "title": row.name + "\n" + row.title + " (" + row.code + ")",
      "class": "chip draggable",
      "style": "width: 15%; height: 100%; margin: 0; text-align: left; border-radius: 0 !important; line-height: inherit !important;"
    }, "<span class='delete-class'></span><span style='overflow: hidden'>" + naming(row.name) + " - " + row.title + "</span>");
    $(rowSelector).append($div);
  }, function(err, nrows) {
  });
  return $row;
}

function buildGrid() {
  var i = 0,
    j = 0;
  var $wizard = $("#wizard");
  for (i = 1; i <= 10; i++) {
    let $sec = $createElement("section");
    $wizard.append($sec);
    $wizard.append($createTextualElement("h1", undefined, i + "ª\nfase", undefined));
    for (j = 1; j <= 3; j++) {
      let $row = $createElement("div", {
        "class": "row"
      });
      let $col = $createElement("div", {
        "class": "col s12"
      });
      $col.append($buildTimeTable(i, j));
      $row.append($col);

      $col = $createElement("div", {
        "class": "col s12"
      });
      $col.append(buildClasses(i, j));
      $row.append($col);

      $sec.append($row);
    }
  }
  $wizard.steps(stepsSettings);
}

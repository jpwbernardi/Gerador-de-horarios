const stepsSettings = {
  headerTag: "h1",
  bodyTag: "section",
  enableAllSteps: true,
  enableKeyNavigation: true,
  enablePagination: false
};
const dragulaOptions = {
  isContainer: function(el) {
    return el.classList.contains("putable");
    // return false; // only elements in drake.containers will be taken into account
  },
  moves: function(el, source, handle, sibling) {
    return el.classList.contains("draggable");
    // return true; // elements are always draggable by default
  },
  accepts: function(el, target, source, sibling) {
    return true; // elements can be dropped in any of the `containers` by default
  },
  invalid: function(el, handle) {
    return false; // don't prevent any drags from initiating by default
  },
  direction: 'vertical', // Y axis is considered when determining where an element would be dropped
  copy: false, // elements are moved by default, not copied
  copySortSource: false, // elements in copy-source containers can be reordered
  revertOnSpill: false, // spilling will put the element back where it was dragged from, if this is true
  removeOnSpill: true, // spilling will `.remove` the element, if this is true
  mirrorContainer: document.body, // set the element that gets mirror elements appended
  ignoreInputTextSelection: true // allows users to select input text, see details below
}
var drake = dragula(dragulaOptions);
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

function buildClasses(semester, shift) {
  var $row = $createElement("div", {
    "semester": semester,
    "shift": shift,
    "class": "row putable"
  });
  var query = {
    string: "select * from professor_subject ps natural join professor p natural join subject s where s.sem = ? and s.period = ?;",
    params: [semester, shift]
  };
  var rowSelector = "div.row.putable[semester=" + semester + "][shift=" + shift + "]";
  db.each(query.string, query.params, function(err, row) {
    // professor.name (siape) - subject.title (code)
    let $div = $createTextualElement("div", {
      "class": "draggable",
      "style": "width: 100%; height: 50%;"
    }, row.name);
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

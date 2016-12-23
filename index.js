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

function $buildTimeTable(tab, shift) {
  var i = 0,
    times = 0;
  var $table = $createElement("table", {
      "tab": tab,
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

  times = 6;
  $tr = $createElement("tr");
  if (shift === 0) {
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 5
    }, "Matutino"));
  } else if (shift === 1) {
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 5
    }, "Vespertino"));
  } else {
    times = 5;
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 4
    }, "Noturno"));
  }
  for (var i = 1; i < times; i++) {
    $tr.append($createTextualElement("td", {}, i + "º"));
    for (var j = 0; j < 6; j++) {
      $tr.append($createElement("td", {
        "tab": tab,
        "shift": shift,
        "day": j,
        "time": i,
        "class": "putable",
        "style": "padding: 0;"
      }));
    }
    $tsec.append($tr);
    if (i < times - 1) {
      $tr = $createElement("tr");
    }
  }
  $table.append($tsec);
  return $table;
}

function buildGrid() {
  var i = 0,
    j = 0;
  var $wizard = $("#wizard");
  for (i = 1; i < 11; i++) {
    let $sec = $createElement("section");
    $wizard.append($sec);
    $wizard.append($createTextualElement("h1", undefined, i + "ª\nfase", undefined));

    let $row = $createElement("div", {
      "class": "row"
    });
    let $col = undefined;

    ////////////////////////////

    for (j = 0; j < 3; j++) {
      $col = $createElement("div", {
        "class": "col s12"
      });
      $col.append($buildTimeTable(i, j));
      $row.append($col);
    }

    ////////////////////////////

    $row.append($col);

    // $col = $createElement("div", {
    //   "class": "col s2"
    // });
    // let $title = $createTextualElement("h5", undefined, i + "ª fase", undefined);

    // $col.append($title);
    $row.append($col);

    $sec.append($row);
  }
  $wizard.steps(stepsSettings);
}


$(".clear").on("click", function() {
  // <a class="waves-effect waves-light btn clear">Limpar</a>
  $( this ).parent().find( "tbody tr td .draggable" ).remove();
});

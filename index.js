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
  copy: function(el, source) {
    return source.classList.contains("dragula-source");
  },
  accepts: function(el, target) {
    return !target.classList.contains("dragula-source") && el.getAttribute("period") === target.getAttribute("period");
  },
  direction: 'vertical', // Y axis is considered when determining where an element would be dropped
  // copy: true, // elements are moved by default, not copied
  copySortSource: false, // elements in copy-source containers can be reordered
  revertOnSpill: true, // spilling will put the element back where it was dragged from, if this is true
  removeOnSpill: false, // spilling will `.remove` the element, if this is true
  mirrorContainer: document.body, // set the element that gets mirror elements appended
  ignoreInputTextSelection: false // if true, allows users to select input text
};

var professorRestrictions = {};
var drake = dragula(dragulaSourceOptions);
drake.on("drag", function(el, source) {
  $(professorRestrictions[el.getAttribute("siape")]).addClass("red restricted");
});
drake.on("over", function(el, container, source) {
  var $el = $(el);
  var $newSiblings = $($(container).children());
  $el.css("width", "100%");
  if (!container.classList.contains("dragula-source")) {
    // if the container el is going to is not .dragula-source
    $newSiblings.push($el);
    adjustHeight($newSiblings);
  }
});
drake.on("drop", function(el, target, source, sibling) {
  var $el = $(el);
  var $siblings = $($(target).children());
  if (target.classList.contains("restricted")) {
    Materialize.toast("Há uma restrição deste professor neste horário!", 2000);
    drake.cancel(true);
  } else {
    // add close button just once
    if ($el.children(".delete-class").children().length === 0) {
      addCloseButton($el);
    }
  }
});
drake.on("out", function(el, container, source) {
  var $el = $(el);
  var $siblings = $($(container).children());
  if (source.classList.contains("dragula-source")) {
    // hack to occupy whole td
    $el.css("height", "100%");
    $el.css("display", "block");
  }
  if (!container.classList.contains("dragula-source")) {
    if (!drake.dragging) {
      adjustHeight($siblings);
      // when we are sure we got out of source,
      // adjust sizes there
      if (!source.classList.contains("dragula-source")) adjustHeight($($(source).children()));
      $(professorRestrictions[el.getAttribute("siape")]).removeClass("red restricted");
    } else {
      // else, if it's just passing by and went out
      // of a container that has a class, restore sizes
      // but when we fly over our source, do not
      // remove el from the height ratio
      if (container !== source) without($siblings, $el, "gu-transit");
      adjustHeight($siblings);
    }
  }
});
drake.on("cancel", function(el, container, source) {
  var $siblings = $($(container).children());
  if (!container.classList.contains("dragula-source")) {
    adjustHeight($siblings);
  }
  $(professorRestrictions[el.getAttribute("siape")]).removeClass("red restricted");
});
buildGrid();
queryProfessorRestrictions();

$("main").on("click", ".clear-single", (event) => {
  var selector = "td.putable[sem=" + event.currentTarget.getAttribute("sem") + "][period=" + event.currentTarget.getAttribute("period") + "]";
  $(selector).empty();
});

$("main").on("click", ".clear-all", (event) => {
  $("#modal-clear-all-sem").html(event.currentTarget.getAttribute("sem"));
  $("#modal-clear-all").modal("open");
  // precisamos do evento original
  $("#modal-clear-all-confirm").off("click.clear-all");
  $("#modal-clear-all-confirm").on("click.clear-all", () => {
    var selector = "td.putable[sem=" + event.currentTarget.getAttribute("sem") + "]";
    $(selector).empty();
  });
});

$("main").on("click", ".make-pdf", (event) => {
  // incluir ação
});

function buildRestrictionSelector(periodDowBlockRow) {
  var selector = ".putable:not(.dragula-source)";
  if (periodDowBlockRow.period !== 0) {
    selector += "[period='" + periodDowBlockRow.period + "']";
  }
  if (periodDowBlockRow.dow !== 0) {
    selector += "[dow='" + periodDowBlockRow.dow + "']";
  }
  if (periodDowBlockRow.block !== 0) {
    selector += "[block='" + periodDowBlockRow.block + "']";
  }
  return selector;
}

function queryProfessorRestrictions() {
  var professorQuery = {
    string: "select distinct siape from professor_restriction;",
    params: []
  };
  db.each(professorQuery.string, professorQuery.params, (siapeErr, siapeRow) => {
    if (siapeErr !== null) {
      syslog(LOG_LEVEL.E, "queryProfessorRestrictions", 1, siapeErr);
    } else {
      var restrictionQuery = {
        string: "select period, dow, block from professor_restriction where siape = ? and active = 1;",
        params: [siapeRow.siape]
      };
      db.all(restrictionQuery.string, restrictionQuery.params, (restrictionErr, restrictionRows) => {
        if (restrictionErr === null) {
          if (restrictionRows.length > 0) {
            professorRestrictions[siapeRow.siape] = buildRestrictionSelector(restrictionRows[0]);
            for (let i = 1; i < restrictionRows.length; i++) professorRestrictions[siapeRow.siape] += ", " + buildRestrictionSelector(restrictionRows[i]);
          }
          syslog(LOG_LEVEL.I, "queryProfessorRestrictions", 1, "Loaded " + restrictionRows.length + " professor restrictions for SIAPE " + siapeRow.siape);
        } else {
          syslog(LOG_LEVEL.E, "queryProfessorRestrictions", 2, restrictionErr);
        }
      });
    }
  });
}

function $buildTimeTable(sem, period) {
  var i = 0,
    times = 0;
  var $table = $createElement("table", {
      "sem": sem,
      "period": period,
      "class": "timetable our-bordered centered"
    }),
    $tsec = $createElement("thead"),
    $tr = $createElement("tr");
  $tr.append($createTextualElement("th", {
    "width": "10%",
    "colspan": "2"
  }, $createTextualElement("button", {
    "sem": sem,
    "period": period,
    "title": "Limpar turno " + shiftText(period) + " da " + sem + "ª fase",
    "class": "btn waves-effect waves-light teal darken-3 light clear-single"
  }, "LIMPAR")));
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
  // "não dá" pra usar shiftText aqui porque
  // tem os rowspan e o times no noturno...
  if (period === 1) {
    $tr.append($createTextualElement("td", {
      "class": "vertical-text",
      "rowspan": 5
    }, "Matutino"));
  } else if (period === 2) {
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
        "sem": sem,
        "period": period,
        "dow": j,
        "block": i,
        "class": "putable"
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

function buildClasses(sem, period) {
  var $row = $createElement("div", {
    "sem": sem,
    "period": period,
    "style": "margin-top: 10px;",
    "class": "row putable dragula-source"
  });
  var query = {
    string: "select * from professor_subject ps natural join professor p natural join subject s where s.sem = ? and s.period = ?;",
    params: [sem, period]
  };
  var rowSelector = "div.row.putable[sem=" + sem + "][period=" + period + "]";
  db.each(query.string, query.params, function(err, row) {
    if (err !== null) {
      syslog(LOG_LEVEL.E, "buildClasses", 1, err);
    } else {
      $(rowSelector).append($createSourceClass(row));
    }
  });
  return $row;
}

function shiftText(number) {
  switch (number) {
    case 1:
    case "1":
      return "matutino";
    case 2:
    case "2":
      return "vespertino";
    case 3:
    case "3":
      return "noturno";
  }
  return "";
}

function buildGrid() {
  var i = 0,
    j = 0;
  var $wizard = $("#wizard");
  for (i = 1; i <= 10; i++) {
    let $sec = $createElement("section");
    $wizard.append($sec);
    $wizard.append($createTextualElement("h1", undefined, i + "ª\nfase"));
    let $row = $createElement("div", {
      "class": "row"
    });
    let $col = $createElement("div", {
      "class": "col s12"
    });
    let $clearAll = $createTextualElement("button", {
      "sem": i,
      "title": "Remover todos os horários da " + i + "ª fase",
      "class": "btn waves-effect waves-light teal darken-3 clear-all right"
    }, "Limpar " + i + "ª fase");
    $col.append($clearAll);
    let $makePDF = $createTextualElement("button", {
      "title": "Gerar PDF",
      "class": "btn waves-effect waves-light teal darken-3 make-pdf right"
    }, "Gerar PDF");
    $col.append($makePDF);
    $row.append($col);
    $sec.append($row);
    for (j = 1; j <= 3; j++) {
      $row = $createElement("div", {
        "class": "row"
      });
      $col = $createElement("div", {
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

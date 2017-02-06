/* Arquivo:   index.js
   Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
              Bernardi, Matheus Henrique Trichez e Vladimir Belinski
   Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
              facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
              Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
              professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
              matutino, vespertino e noturno;
              * 'index.js' corresponde ao arquivo JavaScript referente a 'index.html'.
*/

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
    /* Somente elementos em drake.containers serão considerados */
    // return false;
  },
  moves: function(el, source, handle, sibling) {
    return el.classList.contains("draggable");
    /* Por padrão os elementos são sempre arrastáveis */
    // return true;
  },
  // accepts: function(el, target, source, sibling) {
  /* Por padrão os elementos podem ser soltos em qualquer um dos 'containers' */
  //   return true;
  // },
  invalid: function(el, handle) {
    /* Não impede que quaisquer arrastos sejam iniciados por padrão */
    return false;
  },
  copy: function(el, source) {
    return source.classList.contains("dragula-source");
  },
  accepts: function(el, target) {
    return !target.classList.contains("dragula-source") && el.getAttribute("period") === target.getAttribute("period");
  },
  /* O eixo Y é considerado ao determinar onde um elemento seria solto */
  direction: 'vertical',
  /* Por padrão os elementos são movidos, não copiados */
  // copy: true,
  /* Elementos em containers 'copy-source' podem ser reordenados */
  copySortSource: false,
  /* Se 'true' o elemento será posto de volta no lugar de onde foi arrastado */
  revertOnSpill: true,
  /* Se 'true' o elemento será removido */
  removeOnSpill: false,
  /* Define o elemento que obtém os elementos espelhados anexados */
  mirrorContainer: document.body,
  /* Se 'true' permite aos usuários selecionar o texto de entrada */
  ignoreInputTextSelection: false
};

/* Utilizado para numerar unicamente todos os blocos da grade */
var blockNumber = 0;
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
    attr(el, "blockNumber", attr(target, "blockNumber"));
    gridUpdate(el, target, source, sibling);
    /* Adiciona botão de fechar uma só vez */
    if ($el.children(".delete-class").children().length === 0) {
      addCloseButton($el);
    }
  }
});
drake.on("out", function(el, container, source) {
  var $el = $(el);
  var $siblings = $($(container).children());
  if (source.classList.contains("dragula-source")) {
    /* Para ocupar a td inteira */
    $el.css("height", "100%");
    $el.css("display", "block");
  }
  if (!container.classList.contains("dragula-source")) {
    if (!drake.dragging) {
      adjustHeight($siblings);
      /* Quando temos certeza de que saímos de 'source' ajustamos os tamanhos */
      if (!source.classList.contains("dragula-source")) adjustHeight($($(source).children()));
      $(professorRestrictions[el.getAttribute("siape")]).removeClass("red restricted");
    } else {
      /* Caso contrário, se estamos arrastando uma associação e apenas passando por
      cima de um container que já contém associações, devemos restaurar os tamanhos.
      Porém, neste ajuste, devemos desconsiderar a associação sendo arrastada no
      momento se o container em que passamos não é o container de origem (justamente
      porque estamos apenas passando por cima e a altura total deve ser dividida
      entre as associações que estão lá. Se passamos por cima da origem, quer dizer
      que não saímos de lá ainda, então leva-se em conta a associação sendo arrastada) */
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

setTimeout(loadClassLists, 0, fillBlocks);
buildGrid();
queryProfessorRestrictions();

$("main").on("click", ".clear-single", (event) => {
  let selector = "td.putable > .draggable[sem=" + event.currentTarget.getAttribute("sem") + "][period=" + event.currentTarget.getAttribute("period") + "]";
  let $elems = $(selector);
  beginTransaction(".clear-single onclick");
  classListRemoveAll($elems, commitTransaction, ".clear-single onclick");
  $elems.remove();
});

$("main").on("click", ".clear-all", (event) => {
  $("#modal-clear-all-sem").html(event.currentTarget.getAttribute("sem"));
  $("#modal-clear-all").modal("open");
  /* É necessário o evento original */
  $("#modal-clear-all-confirm").off("click.clear-all");
  $("#modal-clear-all-confirm").on("click.clear-all", () => {
    let selector = "td.putable > .draggable[sem=" + event.currentTarget.getAttribute("sem") + "]";
    let $elems = $(selector);
    beginTransaction(".clear-all onclick");
    classListRemoveAll($elems, commitTransaction, ".clear-all onclick");
    $elems.remove();
  });
});

$("main").on("click", ".make-pdf", (event) => {
  // Incluir ação
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
    string: "select distinct siape from professor_restriction",
    params: []
  };
  db.each(professorQuery.string, professorQuery.params, (siapeErr, siapeRow) => {
    if (siapeErr !== null) {
      syslog(LOG_LEVEL.E, "queryProfessorRestrictions", 1, siapeErr);
    } else {
      var restrictionQuery = {
        string: "select period, dow, block from professor_restriction where siape = ? and active = 1",
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
  /* "Não dá" pra usar shiftText aqui, pois temos os rowspan e o times no noturno */
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
        "blockNumber": blockNumber,
        "sem": sem,
        "period": period,
        "dow": j,
        "block": i,
        "class": "putable"
      }));
      blockNumber += 1;
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
    "style": "margin-top: 10px",
    "class": "row putable dragula-source"
  });
  var query = {
    string: "select * from professor_subject ps natural join professor p natural join subject s where s.sem = ? and s.period = ?",
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

function shiftText(shiftNumber) {
  switch (shiftNumber) {
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
      "class": "btn waves-effect waves-light teal darken-3 make-pdf right",
      "onclick": "openPDF()"
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

function fillBlocks(classLists) {
  for (let i = 0; i < classLists.length; i++) {
    setTimeout(fillBlockFrom, 0, classLists[i]);
  }
}

function fillBlockFrom(classList) {
  let $td = $("td.putable[blockNumber=" + classList.blockNumber + "]");
  classList.eachRow((row) => {
    $td.append($createAddedClass(row));
  });
  adjustHeight($td.children());
}

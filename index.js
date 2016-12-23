const stepsSettings = {
  headerTag: "h1",
  bodyTag: "section",
  enableAllSteps: true,
  enableKeyNavigation: true,
  enablePagination: false
};
const dragulaOptions = {
  isContainer: function (el) {
    return el.classList.contains("putable");
    // return false; // only elements in drake.containers will be taken into account
  },
  moves: function (el, source, handle, sibling) {
    return el.classList.contains("draggable");
    // return true; // elements are always draggable by default
  },
  accepts: function (el, target, source, sibling) {
    return true; // elements can be dropped in any of the `containers` by default
  },
  invalid: function (el, handle) {
    return false; // don't prevent any drags from initiating by default
  },
  direction: 'vertical',             // Y axis is considered when determining where an element would be dropped
  copy: true,                       // elements are moved by default, not copied
  copySortSource: false,             // elements in copy-source containers can be reordered
  revertOnSpill: false,              // spilling will put the element back where it was dragged from, if this is true
  removeOnSpill: true,              // spilling will `.remove` the element, if this is true
  mirrorContainer: document.body,    // set the element that gets mirror elements appended
  ignoreInputTextSelection: true     // allows users to select input text, see details below
}
var drake = dragula(dragulaOptions);
initDragula();
// buildGrid();

function initDragula() {
}

/*
  <thead>
    <tr>
      <th width="5%"></th>
      <th width="5%"></th>
      <th width="15%">Segunda-feira</th>
      <th width="15%">Terça-feira</th>
      <th width="15%">Quarta-feira</th>
      <th width="15%">Quinta-feira</th>
      <th width="15%">Sexta-feira</th>
      <th width="15%">Sábado</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="vertical-text" rowspan=5>Matutino</td>
      <td>1º</td>
      <td class="putable"></td>
      <td class="putable"></td>
      <td class="putable"></td>
      <td class="putable"></td>
      <td class="putable"></td>
      <td class="putable"></td>
    </tr>
    <tr>
      <td>2º</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>3º</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>4º</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
    <tr>
      <td>5º</td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
      <td></td>
    </tr>
  </tbody>
*/

function buildTimeTable(shift) {
  var $table = $createElement("table", {"class": "our-bordered centered"}),
  $thead = $createElement("thead"),
  $tr = $createElement("tr");
}

function buildGrid() {
  var i = 0;
  var $wizard = $("#wizard");
  for (i = 1; i < 11; i++) {
    let $sec = $createElement("section");
    $wizard.append($sec); $wizard.append($createTextualElement("h1", undefined, i + "ª\nfase", undefined));

    let $row = $createElement("div", {"class": "row"});
    let $col = $createElement("div", {"class": "col s10"});

    ////////////////////////////

    // table

    ////////////////////////////

    $row.append($col);

    $col = $createElement("div", {"class": "col s2"});
    let $title = $createTextualElement("h5", undefined, i + "ª fase", undefined);

    $col.append($title);
    $row.append($col);

    $sec.append($row);
  }
  $wizard.steps(stepsSettings);
}


$(".clear").on("click", function() {
  // <a class="waves-effect waves-light btn clear">Limpar</a>
  $( this ).parent().find( "tbody tr td .draggable" ).remove();
});

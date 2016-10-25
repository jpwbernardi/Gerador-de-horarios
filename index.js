// var $wrapper = $createElement("div", {
//   "class": "nav-wrapper container"
// });
//
//
// function $buildGrid(obj, clazz) {
//   var $grid = $createElement("div");
//   if (clazz === "form") $form.append($buildFormRow(obj));
//   else if (clazz === "list") {
//     let rownum = 0;
//     let query = selectAllJoins(obj);
//     db.each(query, function(err, row) {
//       if (err === null)
//         setTimeout(function(rownum) {
//           $form.append($buildListRow(obj, row, rownum));
//         }, 0, rownum++);
//       else syslog("LOG_ERR", "$buildForm", 1, "error fetching " + obj.table + " rows.");
//     }, (err, nrows) => {
//       if (err === null) syslog("LOG_INFO", "$buildForm", 2, "done loading " + nrows + " row(s).");
//       else syslog("LOG_ERR", "$buildForm", 3, err);
//     });
//   }
//   // formObserver.observe($form[0], observerConf);
//   return $form;
// }
buildGrid();

function buildGrid() {
  db.each("select * from professor_subject natural join professor natural join subject", function(err, row) {
    var $div = $createTextualElement("p", {}, row.name + " - " + row.title + " - " + row.sem + "ª fase");
    $(".materias").append($div);
  });
}

$('#calendar').fullCalendar({
  header: {
    left: '',
    center: '',
    right: ''
  },
  locale: 'pt-br',
  editable: true,
  hiddenDays: [0],
  columnFormat: 'dddd',
  slotLabelFormat: 'k',
  defaultView: 'agendaWeek',
  slotDuration: '01:00:00',
  minTime: '01:00:00',
  maxTime: '17:00:00',
  aspectRatio: 3,
  allDaySlot: false,
  slotEventOverlap: false,
  businessHours: [ // specify an array instead
    {
      dow: [1, 2, 3, 4, 5, 6],
      start: '01:00:00', // 8am
      end: '06:00:00' // 6pm
    }, {
      dow: [1, 2, 3, 4, 5],
      start: '07:00:00',
      end: '12:00:00'
    }, {
      dow: [1, 2, 3, 4, 5],
      start: '13:00:00',
      end: '17:00:00'
    }
  ],
  eventConstraint: 'businessHours'
});

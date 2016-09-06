$(".save").click(function(event) {
  var i;
  var table = event.currentTarget.getAttribute("table");
  var elems = $("." + table);
  var correct = true;
  console.log(elems.length);
  let params = [null, elems[0].value];
  let query = "insert into " + table + " values (?, ?";
  for (i = 1; i < elems.length; i++) {
    query += ", ?";
    if (elems[i].type === "checkbox")
      params.push(elems[i].checked);
    else params.push(elems[i].value);
  }
  query += ")";
  console.log("LOG_INFO: " + query);
  console.log("LOG_INFO: " + params);
  db.run(query, params, function(err) {
    if (err !== null) {
      console.log("LOG_ERR: " + err);
      Materialize.toast(err, 3000);
    } else {
      Materialize.toast("Registro salvo com sucesso!", 2000);
    }
  });
});

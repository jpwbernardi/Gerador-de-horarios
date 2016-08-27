function init(db) {
  db.serialize(function() {
    var stmt = null;
    db.parallelize(function() {
      db.run("create table professor(name varchar(64), nickname varchar(32), primary key(name));", function(err) {
        console.log("Professor error: " + err);
        if (err === null) {
          stmt = db.prepare("insert into professor values (?, ?)");
          stmt.run("Graziela Simone Tonin", "Grazi");
          stmt.run("Claunir Pavan", "Pavan");
          stmt.run("José Bins", "Bins");
          stmt.run("Bráulio de Mello", "Bráulio");
          stmt.finalize();
        }
      });
      db.run("create table subject(code varchar(8), title varchar(64), primary key(code));", function(err) {
        console.log("Subject error: " + err);
        if (err === null) {
          stmt = db.prepare("insert into subject values (?, ?)");
          stmt.run("GCH008", "Iniciação à prática científica");
          stmt.run("GEX103", "Engenharia de software II");
          stmt.run("GEX105", "Redes de computadores");
          stmt.run("GEX107", "Computação gráfica");
          stmt.run("GEX108", "Construção de compiladores");
          stmt.finalize();
        }
      });
    });
    db.run("create table link(name varchar(64), code varchar(8), primary key(name, code), foreign key(name) references professor(name), foreign key(code) references subject(code));", function(err) {
      console.log("Link error: " + err);
      if (err === null) {
        stmt = db.prepare("insert into link values (?, ?)");
        stmt.run("Graziela Simone Tonin", "GCH008");
        stmt.run("Graziela Simone Tonin", "GEX103");
        stmt.run("Claunir Pavan", "GEX105");
        stmt.run("José Bins", "GEX107");
        stmt.run("Bráulio de Mello", "GEX108");
        stmt.finalize();
      }
    });
    stmt = null;
  });
}

const db = nodeRequire('electron').remote.getGlobal('db');
init(db);

$(".autocomplete").autocomplete({
  minLength: 0,
  autoFocus: true,
  source: ["First", "Second", "Third"]
  // source: function(request, response) {
    // return [{label: "First", value: 1}, {label: "Second", value: 2}, {label: "Third", value: 3}];
  // }
});
// db.each("select * from link natural join professor natural join subject",
// function(err, row) {
//   console.log("Professor " + row.name + " (a.k.a. " + row.nickname + ") teaches the subject " + row.title + " (" + row.code + ")");
// },
// function(err, nrows) {
//   console.log("Completion error: " + err + "; number of rows retrieved: " + nrows);
// });

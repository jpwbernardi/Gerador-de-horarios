// https://github.com/mapbox/node-sqlite3
// https://github.com/kripken/sql.js
// sqlite.org
// http://node-modules.com/search?u=&q=sqlite

// https://io2015codelabs.appspot.com/codelabs/lovefield#1
// https://google.github.io/lovefield/
var sqlite3 = nodeRequire('sqlite3').verbose();
var db = new sqlite3.Database(':memory:');

db.serialize(function() {
  db.run("CREATE TABLE lorem (info TEXT)");

  var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
  for (var i = 0; i < 10; i++) {
      stmt.run("Ipsum " + i);
  }
  stmt.finalize();

  db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
      console.log(row.id + ": " + row.info);
  });
});

db.close();

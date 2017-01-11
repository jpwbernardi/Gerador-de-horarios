const url = require('url');
const path = require('path');
const ClassList = require("./ClassList.js");
const sqlite3 = require('sqlite3').verbose();
const {app, BrowserWindow, ipcMain} = require('electron');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600});

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  global.db = new sqlite3.Database('scheduler.db', (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('ready')", 1, "Error opening the database: " + err);
  });
  global.db.on('open', () => {
    syslog(LOG_LEVEL.D, "app.on('ready')", 2, "Database opened successfully");
  });
  global.db.on('close', () => {
    syslog(LOG_LEVEL.D, "app.on('ready')", 3, "Database closed successfully");
  });
  // enabling foreign key constraint enforcement (off by default for compatibility)
  global.db.exec("PRAGMA foreign_keys = ON;", (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('ready')", 4, err);
  });
  loadClassesFromDatabase();
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  global.db.close(function(err) {
    if (err !== null) console.log("Error closing the database: " + err);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

global.classRows = null;
global.LOG_LEVEL = {
  V: 0,
  D: 1,
  I: 2,
  W: 3,
  E: 4
};
global.LOG_LEVEL_STRING = ["VERBOSE", "DEBUG", "INFO", "WARNING", "ERROR"];

ipcMain.on("classList.remove", (event, blockIndex, classCounter) => {
  global.classRows[blockIndex].removeCounter(classCounter);
  removeClassFromDatabase(classCounter);
  event.sender.send("classList.remove");
});

function syslog(logLevel, functionName, code, message) {
  console.log(LOG_LEVEL_STRING[logLevel] + ": " + message, "(code " + code + " at " + functionName + ")");
}

function removeClassFromDatabase(classCounter) {
  db.run("with del(prevClass, nextClass) as (select prevClass, nextClass from class where counter = ?)"
    + " update class set nextClass = (select nextClass from del) where counter = (select prevClass from del);", [classCounter], (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "removeClassFromDatabase prevClass update", 1, err);
  });
  db.run("with del(prevClass, nextClass) as (select prevClass, nextClass from class where counter = ?)"
    + " update class set prevClass = (select prevClass from del) where counter = (select nextClass from del);", [classCounter], (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "removeClassFromDatabase nextClass update", 2, err);
  });
  db.run("delete from class where counter = ?", [classCounter], (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "removeClassFromDatabase prevClass update", 3, err);
  });
}

function loadClassesFromDatabase() {
  classRows = [];
  let headCounterQuery = {
    string: "select counter, sem, dow, period, block from class where prevClass is null group by sem, dow, period, block;",
    params: []
  };
  db.each(headCounterQuery.string, headCounterQuery.params, (headCounterErr, headCounterRow) => {
    if (headCounterErr !== null) {
      syslog(LOG_LEVEL.E, "loadClassesFromDatabase", 1, headCounterErr);
    } else {
      let classList = new ClassList();
      loadClassesInto(classList, headCounterRow.counter);
    }
  }, (doneErr, qttyRows) => {
    syslog(LOG_LEVEL.D, "loadClassesFromDatabase", 2, "Loaded " + qttyRows + " rows");
    // mainWindow.webContents.send("classList.loaded");
  });
}

function loadClassesInto(classList, classCounter) {
  let classQuery = {
    // cannot select just professor.* and subject.* because of $createClass column dependencies
    string: "select * from class natural join professor natural join subject where counter = ?;",
    params: [classCounter]
  };
  syslog(LOG_LEVEL.D, "loadClassesInto", 1, "query params: " + classQuery.params);
  db.get(classQuery.string, classQuery.params, function(classErr, classRow) {
    if (classErr !== null) {
      syslog(LOG_LEVEL.E, "loadClassesInto", 2, classErr);
    } else if (typeof classRow === typeof undefined) {
      syslog(LOG_LEVEL.E, "loadClassesInto", 3, "undefined classRow");
    } else {
      classList.pushRow(classRow);
      if (classRow.nextClass !== null) {
        loadClassesInto(classList, classRow.nextClass);
      } else {
        classRows.push(classList);
      }
    }
  });
}

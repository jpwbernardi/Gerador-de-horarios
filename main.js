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
  global.db.serialize();
  // enabling foreign key constraint enforcement (off by default for compatibility)
  global.db.exec("PRAGMA foreign_keys = ON", (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('ready')", 4, err);
  });
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
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('quit')", 1, "Error closing the database: " + err);
  });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

global.LOG_LEVEL = {
  V: 0,
  D: 1,
  I: 2,
  W: 3,
  E: 4
};
global.LOG_LEVEL_STRING = ["VERBOSE", "DEBUG", "INFO", "WARNING", "ERROR"];

function syslog(logLevel, functionName, code, message) {
  console.log(LOG_LEVEL_STRING[logLevel] + ": " + message, "(code " + code + " at " + functionName + ")");
}

ipcMain.on("window.reload", (event) => {
  mainWindow.reload();
});

// ipcMain.on("classList.add", (event, blockNumber, clazz, container, theCounterAfter) => {
//   // global.classLists[blockNumber].insertCounterBefore(clazz.counter, theCounterAfter);
//   addNewClassToDB(blockNumber, container, clazz, theCounterAfter);
//   event.sender.send("classList.add");
// });





/*
push(node) {
  if (this._tail == null) {
    this._head = this._tail = node;
  } else {
    node.prev = this._tail;
    node.next = null;
    this._tail.next = node;
    this._tail = node;
  }
  this._length++;
  return node;
}

insertBefore(node, nodeAfter) {
  if (nodeAfter == null) return this.push(node);
  node.next = nodeAfter;
  node.prev = nodeAfter.prev;
  if (nodeAfter.prev !== null) nodeAfter.prev.next = node;
  else this._head = node;
  nodeAfter.prev = node;
  this._length++;
  return node;
}*/

// function updateNextPrevAndLength(blockNumber, maxCounter, prevCounter) {
//   db.run("update class set prev = ? where counter = ?", [maxCounter, prevCounter], (nextPrevErr) => {
//     if (nextPrevErr === null) {
//       db.run("update class_list set length = length + 1 where blockNumber = ?", [blockNumber], (lengthErr) => {
//         if (lengthErr !== null) {
//           syslog(LOG_LEVEL.E, "updateNextPrevAndLength length update", 2, lengthErr);
//         }
//       });
//     } else {
//       syslog(LOG_LEVEL.E, "updateNextPrevAndLength next prev update", 1, nextPrevErr);
//     }
//   });
// }
//
// function addNewClassToDB(blockNumber, clazz, container, theCounterAfter) {
//   if (theCounterAfter === null) pushNewClassToDB(blockNumber, clazz, container);
//   else {
//     db.get("select max(counter) + 1 as counter from class", (max, maxErr) => {
//       if (maxErr === null) {
//         let insertQuery = {
//           string: "insert into class (counter, sem, dow, period, block, siape, code, next) values (?, ?, ?, ?, ?, ?, ?, ?)",
//           params: [max.counter, clazz.sem, container.dow, clazz.period, container.block, clazz.siape, clazz.code, theCounterAfter]
//         };
//         db.run(insertQuery.string, insertQuery.params, (insertErr) => {
//           if (insertErr === null) {
//             db.get("select prev as counter from class where counter = ?", [theCounterAfter], (prev, prevErr) => {
//               if (prevErr === null) {
//                 db.run("update class set prev = ? where counter = ?", [prev.counter, max.counter], (prevUpdateErr) => {
//                   if (prevUpdateErr === null) {
//                     if (prev.counter !== null) {
//                       db.run("update class set next = ? where counter = ?", [max.counter, prev.counter], (prevNextErr) => {
//                         if (prevNextErr !== null) {
//                           updateNextPrevAndLength(blockNumber, max.counter, prev.counter);
//                         } else {
//                           syslog(LOG_LEVEL.E, "addNewClassToDB prev next update", 5, prevNextErr);
//                         }
//                       });
//                     } else {
//                       db.run("update class_list set head = ? where blockNumber = ?", [max.counter, blockNumber], (headErr) => {
//                         if (headErr === null) {
//                           updateNextPrevAndLength(blockNumber, max.counter, prev.counter);
//                         } else {
//                           syslog(LOG_LEVEL.E, "addNewClassToDB head update", 6, headErr);
//                         }
//                       });
//                     }
//                   } else {
//                     syslog(LOG_LEVEL.E, "addNewClassToDB prev update", 4, prevUpdateErr);
//                   }
//                 });
//               } else {
//                 syslog(LOG_LEVEL.E, "addNewClassToDB prev param", 3, prevErr);
//               }
//             });
//           } else {
//             syslog(LOG_LEVEL.E, "addNewClassToDB insert new class", 2, insertErr);
//           }
//         });
//       } else {
//         syslog(LOG_LEVEL.E, "addNewClassToDB max counter", 1, maxErr);
//       }
//     });
//
//   }
//
//
//
//
//
//
//
//
//
//
//   if (theCounterAfter !== null) {
//
//     db.run("with update(prev) as (select prev from class where counter = ?)"
//       + " update class set next = ? where counter = (select prev from update)", [theCounterAfter, counter], (err) => {
//       if (err !== null) syslog(LOG_LEVEL.E, "addNewClassToDB next update", 2, err);
//     });
//     db.run("update class set prev = ? where counter = ?", [counter, theCounterAfter], (err) => {
//       if (err !== null) syslog(LOG_LEVEL.E, "addNewClassToDB prev update", 3, err);
//     });
//   }
//
//
// }

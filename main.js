/* Arquivo:   main.js
   Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
              Bernardi, Matheus Henrique Trichez e Vladimir Belinski
   Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
              facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
              Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
              professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
              matutino, vespertino e noturno;
              * 'main.js' corresponde ao arquivo JavaScript
*/

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

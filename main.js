/* Arquivo:   main.js
   Autores:   Acácia dos Campos da Terra, Davi Rizzotto Pegoraro, Gabriel Batista Galli, Harold Cristien Santos Becker, João Pedro Winckler
              Bernardi, Matheus Henrique Trichez e Vladimir Belinski
   Descrição: o presente arquivo faz parte do projeto Gerador de Horários, no qual é criada uma aplicação que visa ser uma ferramenta
              facilitadora para a geração dos horários do semestre (em relação aos componentes curriculares) dos cursos de graduação do
              Campus Chapecó da Universidade Federal da Fronteira Sul - UFFS, apresentando uma interface gráfica que permite a manutenção de
              professores, componentes curriculares, associações, restrições e a montagem das grades de 10 fases de um curso para os turnos
              matutino, vespertino e noturno;
              * 'main.js' corresponde ao arquivo JavaScript do processo principal (em background) da aplicação.
*/

const url = require('url');
const path = require('path');
const ClassList = require("./ClassList.js");
const sqlite3 = require('sqlite3').verbose();
const {app, BrowserWindow, ipcMain} = require('electron');

/* Deve ser mantida uma referência global do objeto da janela, pois se não for
feito isso a janela será fechada automaticamente quando o objeto JavaScript for
pego pelo gargabe collector. */
let mainWindow;

function createWindow() {
  /* Cria a janela de navegação */
  mainWindow = new BrowserWindow({width: 800, height: 600});

  /* Carrega o arquivo index.html da aplicação */
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  /* Abre o DevTools */
  // mainWindow.webContents.openDevTools();

  /* Chamado quando a janela é fechada */
  mainWindow.on('closed', function() {
    /* Desreferencia o objeto da janela. Geralmente a janela seria armazenada em
    um vetor se a aplicação suporta multi janelas. Esse é o momento em que o
    elemento correspondente deve ser excluído */
    mainWindow = null;
  });
}

/* Este método será chamado quando o Electron finalizar a inicialização e estiver
pronto para criar as janelas de navegação. Algumas APIs somente podem ser usadas
depois da ocorrência desse evento */
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
  /* Habilitando a imposição de restrições de chave estrangeira (OFF por padrão
  para compatibilidade) */
  global.db.exec("PRAGMA foreign_keys = ON", (err) => {
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('ready')", 4, err);
  });
  createWindow();
});

/* Sai quando todas as janelas são fechadas */
app.on('window-all-closed', () => {
  /* No OS X é comum para aplicações e sua barra de menu ficarem ativas até que
  o usuário saia explicitamente com Cmd + Q */
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  /* No OS X é comum recriar uma janela na aplicação quando o ícone do dock é
  clicado e não há outra janela aberta */
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('quit', () => {
  global.db.close(function(err) {
    if (err !== null) syslog(LOG_LEVEL.E, "app.on('quit')", 1, "Error closing the database: " + err);
  });
});

/* Nesse arquivo pode ser incluído o resto do código específico no processo
principal da aplicação ou adicionar ele em arquivos separados e chamá-los aqui */

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

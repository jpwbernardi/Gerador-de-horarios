// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

window.nodeRequire = require;
delete window.require;
delete window.exports;
delete window.module;

window.$ = window.jQuery = nodeRequire("jquery");

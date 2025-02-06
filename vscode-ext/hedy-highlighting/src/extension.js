const vscode = require('vscode');

const highlighting = require('./highlighting');
const squigglyUnderlining = require('./squiggly-underlining');

const configuracio = vscode.workspace.getConfiguration('hedy');

const underlining = configuracio.get('underlining');
const followVariables = configuracio.get('followVariables');

if(followVariables)
    highlighting.activate();

if(underlining)
    squigglyUnderlining.activate();
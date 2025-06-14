const vscode = require('vscode')
const highlighting = require('./highlighting')
const squigglyUnderlining = require('./squiggly-underlining')
const lang = require('./lang/lang.js')
const preview = require('./preview')

function activate() {
  const configuracio = vscode.workspace.getConfiguration('hedy')
  const underlining = configuracio.get('underlining')
  const followVariables = configuracio.get('followVariables')
  const langView = configuracio.get('extensionLanguage')

  lang.setLang(langView)

  if (followVariables) highlighting.activate()
  if (underlining) squigglyUnderlining.activate()
}

function deactivate() {
  highlighting.deactivate()
  squigglyUnderlining.deactivate()
}

activate()

vscode.workspace.onDidChangeConfiguration(e => {
  if (
    e.affectsConfiguration('hedy.underlining') ||
    e.affectsConfiguration('hedy.followVariables') ||
    e.affectsConfiguration('hedy.extensionLanguage')
  ) {
    console.log('Reloading Hedy extension...')

    deactivate()
    setTimeout(() => {
      activate()
      vscode.window.showInformationMessage(lang.getText('reloading'))
    }, 50)
  }
})

vscode.commands.registerCommand('hedy.showPreviewToSide', preview.showPreviewToSide)

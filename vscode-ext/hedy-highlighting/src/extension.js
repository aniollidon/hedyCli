const vscode = require('vscode')
const highlighting = require('./highlighting')
const squigglyUnderlining = require('./squiggly-underlining')
const lang = require('./lang/lang.js')
const preview = require('./preview')

async function configureGitHubCopilot() {
  const configuracio = vscode.workspace.getConfiguration('github.copilot')
  const hedyConfig = configuracio.get('enable')
  
  // Si ja existeix la configuració per Hedy, no fem res
  if (hedyConfig && typeof hedyConfig === 'object' && Object.keys(hedyConfig).some(key => key.startsWith('hedy'))) {
    return
  }

  const resposta = await vscode.window.showInformationMessage(
    lang.getText('copilot_disable_question'),
    lang.getText('yes'),
    lang.getText('no')
  )

  if (resposta === lang.getText('yes')) {
    try {
      // Obtenim la configuració actual
      const currentConfig = configuracio.get('enable') || {}
      
      // Afegim la configuració per a cada nivell de Hedy
      for (let i = 1; i <= 17; i++) {
        currentConfig[`hedy${i}`] = false
      }

      // Actualitzem la configuració
      await configuracio.update('enable', currentConfig, true)
      vscode.window.showInformationMessage(lang.getText('copilot_disabled'))
    } catch (error) {
      vscode.window.showErrorMessage(lang.getText('copilot_error') + error.message)
    }
  }
}

async function activate() {
  const configuracio = vscode.workspace.getConfiguration('hedy')
  const underlining = configuracio.get('underlining')
  const followVariables = configuracio.get('followVariables')
  const langView = configuracio.get('extensionLanguage')

  lang.setLang(langView)

  if (followVariables) highlighting.activate()
  if (underlining) squigglyUnderlining.activate()

  // Comprovem i configurem GitHub Copilot
  await configureGitHubCopilot()
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



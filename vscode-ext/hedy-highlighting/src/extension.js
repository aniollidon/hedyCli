const vscode = require('vscode')
const highlighting = require('./highlighting')
const squigglyUnderlining = require('./squiggly-underlining')
const lang = require('./lang/lang.js')

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

vscode.commands.registerCommand('hedy.showPreviewToSide', () => {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('Cap document actiu')
    return
  }

  const name = editor.document.fileName.split(/[\/\\]/).pop()
  // extensió (.hy1, .hy2, .hy3... .hy17) només el numero
  const hedyLevel = name.match(/\.hy(\d+)/)
  if (!hedyLevel) {
    vscode.window.showErrorMessage(name + ' is not a valid Hedy file')
    return
  }

  const panel = vscode.window.createWebviewPanel('previewView', `preview: ${name}`, vscode.ViewColumn.Beside, {
    enableScripts: true,
  })

  // Get current document
  const document = editor.document
  const text = document.getText()
  const url = `https://www.hedy.org/render_code/${hedyLevel[1]}/?code=${encodeURIComponent(text)}#start`

  // Actualitzar el contingut de la vista prèvia quan es canvia el document
  const updatePreview = () => {
    const text = document.getText()
    const url = `https://www.hedy.org/render_code/${hedyLevel[1]}/?code=${encodeURIComponent(text)}#start`
    panel.webview.html = `
      <html>
        <head>
          <style>
            body, html {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              overflow: hidden;
            }
            .iframe-container {
              width: 100%;
              height: 100%;
              transform-origin: 0 0;
              transform: scale(0.8); /* Zoom out to 80% */
            }
            iframe {
              width: 125%; /* Compensate for the scale */
              height: 125%; /* Compensate for the scale */
              border: none;
            }
          </style>
        </head>
        <body>
          <div class="iframe-container">
            <iframe src="${url}"></iframe>
          </div>
        </body>
      </html>
    `
  }
  // Actualitzar la vista prèvia quan el document canvia
  const disposable = vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document === document) {
      updatePreview()
    }
  })

  updatePreview()
})

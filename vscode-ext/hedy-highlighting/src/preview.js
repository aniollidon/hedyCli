const vscode = require('vscode')
const lang = require('./lang/lang.js')

let currentPanel = null
let focusTimeout = null

function createPreviewPanel(editor) {
  const name = editor.document.fileName.split(/[\/\\]/).pop()
  const hedyLevel = name.match(/\.hy(\d+)/)
  if (!hedyLevel) {
    vscode.window.showErrorMessage(name + ' is not a valid Hedy file')
    return
  }

  if (currentPanel) {
    currentPanel.dispose()
  }

  const panel = vscode.window.createWebviewPanel('previewView', `preview: ${name}`, vscode.ViewColumn.Two, {
    enableScripts: true,
    retainContextWhenHidden: true
  })

  // Funció per gestionar el focus
  const handleFocus = () => {
    if (focusTimeout) {
      clearTimeout(focusTimeout)
    }
    focusTimeout = setTimeout(() => {
      vscode.commands.executeCommand('workbench.action.focusFirstEditorGroup')
    }, 2000)
  }

  // Afegir listeners per interaccions
  panel.webview.onDidReceiveMessage(() => {
    handleFocus()
  })

  panel.onDidChangeViewState(e => {
    if (e.webviewPanel.active) {
      handleFocus()
    }
  })

  currentPanel = panel

  const document = editor.document
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
              transform: scale(0.8);
            }
            iframe {
              width: 125%;
              height: 125%;
              border: none;
            }
          </style>
          <script>
            // Enviar missatge quan hi ha interacció
            window.addEventListener('mousemove', () => {
              vscode.postMessage({ type: 'interaction' });
            });
            window.addEventListener('click', () => {
              vscode.postMessage({ type: 'interaction' });
            });
          </script>
        </head>
        <body>
          <div class="iframe-container">
            <iframe src="${url}"></iframe>
          </div>
        </body>
      </html>
    `
  }

  const disposables = [
    vscode.workspace.onDidChangeTextDocument(event => {
      if (event.document === document) {
        updatePreview()
      }
    })
  ]

  panel.onDidDispose(() => {
    disposables.forEach(d => d.dispose())
    if (focusTimeout) {
      clearTimeout(focusTimeout)
    }
    currentPanel = null
  })

  updatePreview()
}

function showPreviewToSide() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showErrorMessage('Cap document actiu')
    return
  }

  createPreviewPanel(editor)
}

// Listener global per canvis en el document actiu
vscode.window.onDidChangeActiveTextEditor(editor => {
  if (editor && currentPanel) {
    const name = editor.document.fileName.split(/[\/\\]/).pop()
    const hedyLevel = name.match(/\.hy(\d+)/)
    if (hedyLevel) {
      currentPanel.title = `preview: ${name}`
      const text = editor.document.getText()
      const url = `https://www.hedy.org/render_code/${hedyLevel[1]}/?code=${encodeURIComponent(text)}#start`
      currentPanel.webview.html = `
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
                transform: scale(0.8);
              }
              iframe {
                width: 125%;
                height: 125%;
                border: none;
              }
            </style>
            <script>
              // Enviar missatge quan hi ha interacció
              window.addEventListener('mousemove', () => {
                vscode.postMessage({ type: 'interaction' });
              });
              window.addEventListener('click', () => {
                vscode.postMessage({ type: 'interaction' });
              });
            </script>
          </head>
          <body>
            <div class="iframe-container">
              <iframe src="${url}"></iframe>
            </div>
          </body>
        </html>
      `
    }
  }
})

module.exports = {
  showPreviewToSide
} 
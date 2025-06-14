const vscode = require('vscode')
const lang = require('./lang/lang.js')

function createPreviewPanel(editor) {
  const name = editor.document.fileName.split(/[\/\\]/).pop()
  const hedyLevel = name.match(/\.hy(\d+)/)
  if (!hedyLevel) {
    vscode.window.showErrorMessage(name + ' is not a valid Hedy file')
    return
  }

  const panel = vscode.window.createWebviewPanel('previewView', `preview: ${name}`, vscode.ViewColumn.Beside, {
    enableScripts: true,
  })

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
        </head>
        <body>
          <div class="iframe-container">
            <iframe src="${url}"></iframe>
          </div>
        </body>
      </html>
    `
  }

  const disposable = vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document === document) {
      updatePreview()
    }
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

module.exports = {
  showPreviewToSide
} 
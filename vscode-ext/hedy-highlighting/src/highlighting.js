const vscode = require('vscode')
const { EntityDefinitions } = require('./grammar/entities')

const tokenTypes = ['function', 'variable', 'parameter']
const tokenModifiers = ['declaration', 'use']
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers)
const disposables = []

class Provider {
  constructor(level) {
    this._level = level
    this._finder = new EntityDefinitions(level)
  }

  provideDocumentSemanticTokens(document, token) {
    this._finder.clean()
    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber)
      const text = line.text
      this._finder.analizeLine(text, lineNumber)
    }

    const tokensBuilder = new vscode.SemanticTokensBuilder(legend)

    for (const token of this._finder.tokens) {
      tokensBuilder.push(
        new vscode.Range(
          new vscode.Position(token.line, token.startChar),
          new vscode.Position(token.line, token.startChar + token.length),
        ),
        token.type,
        token.modifiers,
      )
    }

    return tokensBuilder.build()
  }
}

function activate() {
  for (let level = 2; level < 18; level++) {
    const disposable = vscode.languages.registerDocumentSemanticTokensProvider(
      { language: `hedy${level}`, scheme: 'file' },
      new Provider(level),
      legend,
    )
    disposables.push(disposable)
  }
}

function deactivate() {
  for (const disposable of disposables) {
    disposable.dispose()
  }
}

module.exports = {
  activate,
  deactivate,
}

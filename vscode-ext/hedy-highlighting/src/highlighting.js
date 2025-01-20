const vscode = require('vscode');
const {EntityDefinitions} = require('./definitions');

const tokenTypes = ['function', 'variable', 'parameter'];
const tokenModifiers = ['declaration', 'use'];
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

class Provider {
  constructor(level) {
    this._level = level;
    this._finder = new EntityDefinitions(level);
  }

  provideDocumentSemanticTokens(document, token) {
    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber);
      const text = line.text;
      this._finder.analitza_linia(text, lineNumber);
    }

    const tokensBuilder = new vscode.SemanticTokensBuilder(legend);
    
    for (const token of this._finder.tokens) {
      tokensBuilder.push(
        new vscode.Range(new vscode.Position(token.line, token.startChar), new vscode.Position(token.line, token.startChar + token.length)),
        token.type,
        token.modifiers
      );
    }
    
    return tokensBuilder.build();
  }
}

function activate() {
  for (let level = 2; level < 18; level++) {
    vscode.languages.registerDocumentSemanticTokensProvider({ language: `hedy${level}`, scheme: 'file' }, new Provider(level), legend);
  }
}

module.exports = {
  activate
};

const vscode = require('vscode');
const {CheckHedy} = require('./checks');

function onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document){
    const diagnostics = [];
    const hedy = new CheckHedy(hedyLevel);

    for(let i = 0; i < lines.length; i++){
      // Esborra qualsevol comentari a partir de #
      const line = lines[i].split("#")[0];
      const errors = hedy.analyse(line, i);
      if (errors !== null){
        for (let err of errors){
          const error = err.get();
            const severity = error.severity === "warning" ? vscode.DiagnosticSeverity.Warning : 
                     error.severity === "info" ? vscode.DiagnosticSeverity.Information : 
                     vscode.DiagnosticSeverity.Error;
            const diagnostic = new vscode.Diagnostic(new vscode.Range(i, error.start, i, error.end), error.message, severity);
            if(error.codeerror) diagnostic.code = error.codeerror;
            diagnostics.push(diagnostic);
        }
      }
    }
  
    diagnosticCollection.set(document.uri, diagnostics);
    return;
}


// Proveïdor de CodeActions
class QuickFixCodeActionProvider {
  constructor(level) {
    this._level = level;
  }

  static get providedCodeActionKinds() {
      return [vscode.CodeActionKind.QuickFix];
  }

    provideCodeActions(document, range, context, token) {
        const codeActions = [];

        context.diagnostics.forEach((diagnostic) => {
            if (diagnostic.code === 'hy-recomended-equal') {
              const fix = new vscode.CodeAction(
              "Reemplaça 'is' per '='",
              vscode.CodeActionKind.QuickFix
              );
              fix.edit = new vscode.WorkspaceEdit();
              fix.edit.replace(document.uri, diagnostic.range, '=');
              fix.diagnostics = [diagnostic];
              fix.isPreferred = true; // Marca com a preferida aquesta solució
              codeActions.push(fix);
            } else if (diagnostic.code === 'hy-to-lowercase-command') {
              const fix = new vscode.CodeAction(
              "Converteix la comanda a minúscules",
              vscode.CodeActionKind.QuickFix
              );
              fix.edit = new vscode.WorkspaceEdit();
              const command = document.getText(diagnostic.range).toLowerCase();
              fix.edit.replace(document.uri, diagnostic.range, command);
              fix.diagnostics = [diagnostic];
              fix.isPreferred = true; // Marca com a preferida aquesta solució
              codeActions.push(fix);
            }
            else if (diagnostic.code === 'hy-recomended-equalequal') {
              const fix = new vscode.CodeAction(
              "Reemplaça '=' per '=='",
              vscode.CodeActionKind.QuickFix
              );
              fix.edit = new vscode.WorkspaceEdit();
              fix.edit.replace(document.uri, diagnostic.range, '==');
              fix.diagnostics = [diagnostic];
              fix.isPreferred = true; // Marca com a preferida aquesta solució
              codeActions.push(fix);
            }
            else if (diagnostic.code === 'hy-unnecessary-quotes') {
              const fix = new vscode.CodeAction(
              "Elimina les cometes",
              vscode.CodeActionKind.QuickFix
              );
              fix.edit = new vscode.WorkspaceEdit();
              const text = document.getText(diagnostic.range);
              const newtext = text.substring(1, text.length - 1);
              fix.edit.replace(document.uri, diagnostic.range, newtext);
              fix.diagnostics = [diagnostic];
              fix.isPreferred = true; // Marca com a preferida aquesta solució
              codeActions.push(fix);
            }
            else if (diagnostic.code === 'hy-text-must-be-quoted'){
              const fix = new vscode.CodeAction(
              "Afegeix cometes",
              vscode.CodeActionKind.QuickFix
              );
              fix.edit = new vscode.WorkspaceEdit();
              const text = document.getText(diagnostic.range);
              const newtext = `"${text}"`;
              fix.edit.replace(document.uri, diagnostic.range, newtext);
              fix.diagnostics = [diagnostic];
              fix.isPreferred = true; // Marca com a preferida aquesta solució
              codeActions.push(fix);
            }
        });

        return codeActions;
    }
  }


function activate(){
    for (let level = 1; level < 18; level++) {
      vscode.languages.registerCodeActionsProvider({ language: `hedy${level}`, scheme: 'file' }, new QuickFixCodeActionProvider(level));
    }

    let diagnosticCollection = vscode.languages.createDiagnosticCollection("hedy_errors");

    vscode.workspace.onDidChangeTextDocument(event => {
    if (!event.document.languageId.startsWith("hedy")) return;
    if(event.contentChanges.length === 0) return;
    const hedyLevel = parseInt(event.document.languageId.replace("hedy", ""));

    const document = event.document;
    const lines = document.getText().split("\n");
    try {
        onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document);
    } catch (error) {
        console.error(error);
        throw error;
    };
  });
}

module.exports = {
    activate
};
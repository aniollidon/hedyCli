const vscode = require('vscode');
const {CheckHedy} = require('./checks');

function onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document){
    const diagnostics = [];
    const hedy = new CheckHedy(hedyLevel);

    for(let i = 0; i < lines.length; i++){
      // Esborra qualsevol comentari a partir de #
      const line = lines[i].split("#")[0];
      const errors = hedy.checkErrors(line, i);
      if (errors !== null){
        for (let error of errors){
            const severity = error.severity === "warning" ? vscode.DiagnosticSeverity.Warning : 
                     error.severity === "info" ? vscode.DiagnosticSeverity.Information : 
                     vscode.DiagnosticSeverity.Error;
          diagnostics.push(new vscode.Diagnostic(new vscode.Range(i, error.start, i, error.end), error.message, severity));
        }
      }
    }
  
    diagnosticCollection.set(document.uri, diagnostics);
    return;
}

function activate(){
    let diagnosticCollection = vscode.languages.createDiagnosticCollection("hedy_errors");

    vscode.workspace.onDidChangeTextDocument(event => {
    if (!event.document.languageId.startsWith("hedy")) return;
    const hedyLevel = parseInt(event.document.languageId.replace("hedy", ""));

    const document = event.document;
    const lines = document.getText().split("\n");
    try {
        onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document);
    } catch (error) {
        console.log(error);
        throw error;
    };
  });
}

module.exports = {
    activate
};
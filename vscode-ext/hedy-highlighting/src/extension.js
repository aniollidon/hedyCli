const vscode = require('vscode');

const tokenTypes = ['function', 'variable'];
const tokenModifiers = ['declaration', 'use'];
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);


class Provider{
  constructor(hasQuotes = false, define_operator = "is", define_inline_bucle = false, define_by_for = false, define_functions = false){
    this._hasQuotes = hasQuotes;
    this._define_operator = define_operator;
    this._define_inline_bucle = define_inline_bucle;
    this._define_by_for = define_by_for;
    this._define_functions = define_functions;
  }
  provideDocumentSemanticTokens(document, token){
    // analyze the document and return semantic tokens
    const tokensBuilder = new vscode.SemanticTokensBuilder(legend);

      const variableNames = new Set();
      const functionNames = new Set();

      // Recorre cada línia del document
      for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
          const line = document.lineAt(lineNumber);
          const text = line.text;

          // Busca declaracions de variables
          let before_def = "^";

          if (this._define_inline_bucle)
            before_def = "(?:^|\\btimes\\b)";

          const declarationRegex = new RegExp(`${before_def}[\\t ]*\\b(\\w+)\\s+(${this._define_operator})`, 'g'); // Regex per trobar `var is|=`

          let match;
          while ((match = declarationRegex.exec(text)) !== null) {
            const variableName = match[1];
            const startChar = match.index + match[0].indexOf(variableName);

            // Afegeix el nom de la variable al conjunt
            variableNames.add(variableName);

            // Afegeix el token semàntic per a la declaració
            tokensBuilder.push(
            new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
            'variable',
            ['declaration']
            );
          }

          // Si define_by_for és cert, busca declaracions entre for i in
          if (this._define_by_for) {
            const forInRegex = /\bfor\s+(\w+)\s+in\b/g;
            let forMatch;
            while ((forMatch = forInRegex.exec(text)) !== null) {
              const variableName = forMatch[1];
              const startChar = forMatch.index + forMatch[0].indexOf(variableName);

              // Afegeix el nom de la variable al conjunt
              variableNames.add(variableName);

              // Afegeix el token semàntic per a la declaració
              tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
              'variable',
              ['declaration']
              );
            }
          }

          // Si define_functions és cert, busca declaracions de funcions 
          if (this._define_functions) {
            // TODO
          }
          // Busca referències a variables
          for (const variableName of variableNames) {
              const referenceRegex = new RegExp(`\\b${variableName}\\b`, 'g');

              let refMatch;
              while ((refMatch = referenceRegex.exec(text)) !== null) {
                if(this._hasQuotes){ // Evita si la referència està dins de cometes
                  const startChar = refMatch.index;

                  let contasimple = 0;
                  let contaDoble = 0;
                  for (let i = 0; i < startChar; i++) {
                    if (text[i] === '"') 
                      contaDoble++;

                    if (text[i] === "'")
                      contasimple++;
                  }

                  if (contasimple % 2 === 1 || contaDoble % 2 === 1)
                    continue;
                }

                  const startChar = refMatch.index;
                  // Afegeix el token semàntic per a la referència
                  tokensBuilder.push(
                    new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
                    'variable',
                    ['use']
                  );
                }
          }
      }

    return tokensBuilder.build();
  }
};

const providerBefore4 = new Provider(true, "is"); // Les cometes no existeixen
const provider4and5 = new Provider(true, "is");
const provider6and8and9 = new Provider(true, "is|=");
const provider7 = new Provider(true, "is|=", true);
const provider10and11= new Provider(true, "is|=", false, true);
const provider12to14 = new Provider(true, "is|=", true, true); // TODO FUNCIONS!!

vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy2', scheme: 'file' }, providerBefore4, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy3', scheme: 'file' }, providerBefore4, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy4', scheme: 'file' }, provider4and5, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy5', scheme: 'file' }, provider4and5, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy6', scheme: 'file' }, provider6and8and9, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy7', scheme: 'file' }, provider7, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy8', scheme: 'file' }, provider6and8and9, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy9', scheme: 'file' }, provider6and8and9, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy10', scheme: 'file' }, provider10and11, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy11', scheme: 'file' }, provider10and11, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy12', scheme: 'file' }, provider12to14, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy13', scheme: 'file' }, provider12to14, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy14', scheme: 'file' }, provider12to14, legend);
const vscode = require('vscode');

const tokenTypes = ['function', 'variable', 'parameter'];
const tokenModifiers = ['declaration', 'use'];
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);


class Provider{
  constructor(hasQuotes = false, hasScopes = false, define_var_operator = "is", define_var_inline_bucle = false, define_var_by_for = false, 
    define_functions = false, define_fun_with = false){
    this._hasQuotes = hasQuotes;
    this._hasScopes = hasScopes;
    this._define_var_operator = define_var_operator;
    this._define_var_inline_bucle = define_var_inline_bucle;
    this._define_var_by_for = define_var_by_for;
    this._define_functions = define_functions;
    this._define_fun_with = define_fun_with;
  }
  provideDocumentSemanticTokens(document, token){
    // analyze the document and return semantic tokens
    const tokensBuilder = new vscode.SemanticTokensBuilder(legend);

      const names = {};

      // Recorre cada línia del document
      for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {

          const line = document.lineAt(lineNumber);
          const text = line.text;

          // troba la posició del primer caràcter no espaiat de la línia
          const firstNoSpaceChar = text.search(/\S/);
          const textNotEmptyOrComment = firstNoSpaceChar !== -1 && text[firstNoSpaceChar] !== '#';
          
          if(!textNotEmptyOrComment) continue; // Si la línia està buida o és un comentari, no cal fer res
          const scope  = firstNoSpaceChar;

          // Posa a lloc les variables que s'han de setejar a la següent posició i esborra aquelles fora de l'abast
          for (const variableName in names) {
            if (names[variableName].scope === undefined) {
              names[variableName].scope = scope;
              continue;
            }

            if (this._hasScopes && scope < names[variableName].scope) {
              delete names[variableName];
            }
          }

          // Busca declaracions de variables
          let before_def = "^";

          if (this._define_var_inline_bucle)
            before_def = "(?:^|\\btimes\\b)";

          const declarationRegex = new RegExp(`${before_def}[\\t ]*\\b(\\w+)\\s+(${this._define_var_operator})`, 'g'); // Regex per trobar `var is|=`

          let match;
          while ((match = declarationRegex.exec(text)) !== null) {
            const variableName = match[1];
            const startChar = match.index + match[0].indexOf(variableName);

            // Afegeix el nom de la variable al conjunt
            if(!names[variableName])
              names[variableName] = {scope: scope, type: 'variable'};

            // Afegeix el token semàntic per a la declaració
            tokensBuilder.push(
            new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
            'variable',
            ['declaration']
            );
          }

          // Si define_var_by_for és cert, busca declaracions entre for i in
          if (this._define_var_by_for) {
            const forInRegex = /\bfor\s+(\w+)\s+in\b/g;
            let forMatch;
            while ((forMatch = forInRegex.exec(text)) !== null) {
              const variableName = forMatch[1];
              const startChar = forMatch.index + forMatch[0].indexOf(variableName);

              // Afegeix el nom de la variable al conjunt
              if(!names[variableName])
                names[variableName] = {scope: undefined, type: 'variable'}; // undefined per indicar que s'ha de setejar a la següent posició
              
              // Afegeix el token semàntic per a la declaració
              tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
              'variable',
              ['declaration']
              );
            }
          }

          // Si define_fun_with és cert, busca declaracions de funcions amb with
          if(this._define_fun_with){
            const withRegex = /\bwith\s+(\w+)\b/g;
            let withMatch;
            while ((withMatch = withRegex.exec(text)) !== null) {
        
              const param_name = withMatch[1];
              const startChar = withMatch.index + withMatch[0].indexOf(param_name);

              
              // Afegeix el nom de la variable al conjunt
              if(!names[param_name])
                names[param_name] = {scope: undefined, type: 'parameter'}; // undefined per indicar que s'ha de setejar a la següent posició

              // Afegeix el token semàntic per a la declaració
              tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + param_name.length)),
              'parameter',
              ['declaration']
              );
            }
          }

          // Si _define_functions és cert, busca declaracions de funcions 
          if (this._define_functions) {
            // TODO
            
            const funtionDeclRegex = new RegExp('[\\t ]*(define)[\\t ]*\\b(\\w+)', 'g'); // Regex per trobar `define funcio`
            let match2;
            
            while ((match2 = funtionDeclRegex.exec(text)) !== null) {
              const functionName = match2[2];
              const startChar = match2.index + match2[0].indexOf(functionName);
  
              // Afegeix el nom de la variable al conjunt
              if(!names[functionName])
                names[functionName] = {scope: scope, type: 'function'};

              // Afegeix el token semàntic per a la declaració
              tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + functionName.length)),
              'function',
              ['declaration']
              );
            }
              
          }

          // Busca referències a variables
          for (const variableName in names) {
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
                    names[variableName].type,
                    ['use']
                  );
                }
          }
      }

    return tokensBuilder.build();
  }
};

/* HEDY NIVELLS:
N1: (no provider)
  + print | ask | echo | play | turn | forward
  Comentaris amb #
  No commetes

N2: 
  Variables (definides amb is)
  + is  | sleep
  - echo
 
N3:
  Llistes
    + at random
    + remove .. from | add .. to

N4:
  Stings amb cometes: "" | ''
  + clear
  
N5:
  Condicionals: 
    + if | else
    + in | not in
    + pressed:  >> if g is pressed

N6: 
  Mates: + | - | * | /
  S'afegeix l'operador = per definir variables (s'accepta is o =)

N7:
  Bulces: (inline) repeat .. times
    + repeat | times

N8:
  Identació per bucles i condicionals

N9:
  Identació dins identació

N10:
  Bucles for .. in
  + for | in

N11:
  Bucles for .. in range .. to ..
  + range | to

N12:
  Mates amb decimals
  Funcions sense paràmetres:
    + define
    + call
  Cometes a totes les strings: llistes o comparcions

N13: 
  Funcions amb paràmetres
    + with
  Comparacions avançades
    + and | or 

N14:
  Comparacions avançades II
   + Nous operadors: > | < | >= | <= | == | !=
  Funcions amb retorn
    + return

N15:
 Bucles while
  + while

N16:
 Accedir als elements d'una llista amb []
 Es defineixen les llistes amb []
 Deseapareix at random i s'usa [random]
  - at

N17:
 Afegim els dos punts a l'inici dels blocs identats (:)
 Condicilals amb elif
  + elif

N18:
  PYTHON COMPLET

*/


const providerBefore4 = new Provider(false, false, "is"); // Les cometes no existeixen
const provider4and5 =   new Provider(true, false, "is"); // Les cometes existeixen
const provider6 =       new Provider(true, false, "is|=");  // defineix amb = 
const provider7 =       new Provider(true, false, "is|=", true); // bucle inline
const provider8and9 =   new Provider(true, true, "is|=");  // Hi ha scope per les definicions
const provider10and11=  new Provider(true, true, "is|=", false, true); // for .. in
const provider12 =      new Provider(true, true, "is|=", false, true, true); // functions!
const provider13to17 = new Provider(true, true, "is|=", false, true, true, true); // funcions + with!


vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy2', scheme: 'file' }, providerBefore4, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy3', scheme: 'file' }, providerBefore4, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy4', scheme: 'file' }, provider4and5, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy5', scheme: 'file' }, provider4and5, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy6', scheme: 'file' }, provider6, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy7', scheme: 'file' }, provider7, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy8', scheme: 'file' }, provider8and9, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy9', scheme: 'file' }, provider8and9, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy10', scheme: 'file' }, provider10and11, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy11', scheme: 'file' }, provider10and11, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy12', scheme: 'file' }, provider12, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy13', scheme: 'file' }, provider13to17, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy14', scheme: 'file' }, provider13to17, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy15', scheme: 'file' }, provider13to17, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy16', scheme: 'file' }, provider13to17, legend);
vscode.languages.registerDocumentSemanticTokensProvider({ language: 'hedy17', scheme: 'file' }, provider13to17, legend);

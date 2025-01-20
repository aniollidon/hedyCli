const vscode = require('vscode');
const { entreCometes, enUnaLlista } = require('./utils');
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

const tokenTypes = ['function', 'variable', 'parameter'];
const tokenModifiers = ['declaration', 'use'];
const legend = new vscode.SemanticTokensLegend(tokenTypes, tokenModifiers);

function parseImportFunctions(input) {
  input = input.replace(/[^a-zA-Z0-9,_()]/g, ''); // Elimina tots els caràcters que no siguin lletres, números, comes i parèntesis
  const regex = /([\p{L}_\d]+) *(?:\(([^)]*)\))?/gu;
  const result = [];
  let match;

  while ((match = regex.exec(input)) !== null) {
      const name = match[1]; // Nom de la funció
      const args = match[2] ? match[2].split(",").map(arg => arg.trim()) : []; // Arguments, si n'hi ha
      result.push({ name, args });
  }

  return result;
}

class Provider {
  constructor(level) {
    this._level = level;
    this._hasQuotes = level >= 4;
    this._hasScopes = level >= 8;
    this._define_var_operator = level >= 6 ? "is|=" : "is";
    this._define_var_inline_bucle = level >= 7;
    this._define_var_by_for = level >= 10;
    this._define_functions = level >= 12;
    this._define_fun_with = level >= 13;
  }

  provideDocumentSemanticTokens(document, token) {
    const tokensBuilder = new vscode.SemanticTokensBuilder(legend);
    const names = {};

    // Recorre cada línia del document
    for (let lineNumber = 0; lineNumber < document.lineCount; lineNumber++) {
      const line = document.lineAt(lineNumber);
      const text = line.text;

      // troba la posició del primer caràcter no espaiat de la línia
      const firstNoSpaceChar = text.search(/[^ ]/);
      const specialComment = text.search("#!");
      const textEmptyOrComment = firstNoSpaceChar === -1 || text[firstNoSpaceChar] === '#' && specialComment === -1;

      if (textEmptyOrComment) continue; // Si la línia està buida o és un comentari, no cal fer res
      const scope = firstNoSpaceChar;

      // Posa a lloc les variables que s'han de setejar a la següent posició i esborra aquelles fora de l'abast
      for (const variableName in names) {
        if (names[variableName].scope === undefined) {
          names[variableName].scope = scope;
          continue;
        }

        if (this._hasScopes && scope < names[variableName].scope) {
          // TODO: NO s'ha de borrar el nom de la variable si el scope és més petit que el de la variable (... o sí?)
          // De fet, a l'scope de funcions s'ha de borrar SEGUR
          // A la resta no és bona praxis, però no és incorrecte
          delete names[variableName];
        }
      }

      // Busca declaracions de variables
      let before_def = "^";
      if (this._define_var_inline_bucle) before_def = "(?:^|\\btimes\\b)";

      // Regex per trobar `var is|=`
      const declarationRegex = new RegExp(`${before_def} *\\b([\\p{L}_\\d]+) *( ${this._define_var_operator})`, 'gu');

      let match;
      while ((match = declarationRegex.exec(text)) !== null) {
        const variableName = match[1];
        const startChar = match.index + match[0].indexOf(variableName);

        if (!names[variableName]) names[variableName] = { scope: scope, type: 'variable', def_line: lineNumber, def_char: startChar};
        tokensBuilder.push(
          new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
          'variable',
          ['declaration']
        );
      }

      // Busca declaracions entre for i in
      if (this._define_var_by_for) {
        const forInRegex = /\bfor +([\p{L}_\d]+) +in\b/gu;
        let forMatch;
        while ((forMatch = forInRegex.exec(text)) !== null) {
          const variableName = forMatch[1];
          const startChar = forMatch.index + forMatch[0].indexOf(variableName);

          if (!names[variableName]) names[variableName] = { scope: undefined, type: 'variable', def_line: lineNumber, def_char: startChar };

          tokensBuilder.push(
            new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + variableName.length)),
            'variable',
            ['declaration']
          );
        }
      }
      // Busca declaracions de funcions amb with
      if (this._define_fun_with) {
        const withRegex = /define +[\p{L}_\d]+ with +(.+)/gu;
        let withMatch;
        while ((withMatch = withRegex.exec(text)) !== null) {
          const params = withMatch[1].split(',');
          for (const param of params) {
            const param_name = param.trim();
            const startChar = withMatch.index + withMatch[0].indexOf(param_name);

            if (!names[param_name]) names[param_name] = { scope: undefined, type: 'parameter', def_line: lineNumber, def_char: startChar};

            tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + param_name.length)),
              'parameter',
              ['declaration']
            );
          }
        }
      }

      // Busca declaracions de funcions 
      if (this._define_functions) {
        const funtionDeclRegex = new RegExp(' *(define) *\\b([\\p{L}_\\d]+)', 'gu'); // Regex per trobar `define funcio`
        let match2;

        while ((match2 = funtionDeclRegex.exec(text)) !== null) {
          const functionName = match2[2];
          const startChar = match2.index + match2[0].indexOf(functionName);

          if (!names[functionName]) names[functionName] = { scope: 0, type: 'function', def_line: lineNumber, def_char: startChar};

          tokensBuilder.push(
            new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + functionName.length)),
            'function',
            ['declaration']
          );
        }
      }

      // Busca usos de funcions per importar
      if (this._define_functions) {
        const importFunDeclRegex = new RegExp("^# *! *import +(.*) +from +[\\p{L}_\\d]+", 'gu');
        let match2;
        while ((match2 = importFunDeclRegex.exec(text)) !== null) {
          let functionsToimportText = match2[1];

          if (!functionsToimportText) continue;

          const defFunctions = parseImportFunctions(functionsToimportText);

          for (const funct of defFunctions) {
            const functionName = funct.name;
            const startChar = text.indexOf(functionName);

            if (!functionName || startChar < 0) continue;

            if (!names[functionName]) names[functionName] = { scope: 0, type: 'function', def_line: lineNumber, def_char: startChar};

            tokensBuilder.push(
              new vscode.Range(new vscode.Position(lineNumber, startChar), new vscode.Position(lineNumber, startChar + functionName.length)),
              'function',
              ['declaration']
            );
          }
        }
      }

      // Busca referències a variables
      for (const variableName in names) {
        const referenceRegex = new RegExp(`(?<![\\p{L}_\\d])${variableName}(?![\\p{L}_\\d])`, 'gu');

        let refMatch;
        while ((refMatch = referenceRegex.exec(text)) !== null) {
          const startChar = refMatch.index;

          // Evita que es marqui com a referència a la mateixa línia de la definició
          if(names[variableName].def_line === lineNumber && names[variableName].def_char === startChar) continue; 

          if (enUnaLlista(text, startChar, this._hasQuotes, this._define_var_operator)) 
            continue;

          if (this._hasQuotes && entreCometes(text, startChar)) continue;

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
}

function activate() {
  for (let level = 1; level < 18; level++) {
    vscode.languages.registerDocumentSemanticTokensProvider({ language: `hedy${level}`, scheme: 'file' }, new Provider(level), legend);
  }
}

module.exports = {
  activate
};

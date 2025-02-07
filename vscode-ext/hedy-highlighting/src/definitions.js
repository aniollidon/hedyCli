const { entreCometes, enUnaLlista, varDefinitionType } = require('./utils');

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

class EntityDefinitions {
    constructor(level) {
      this._level = level;
      this._hasQuotes = level >= 4;
      this._hasScopes = level >= 8;
      this._define_var_operator = level >= 6 ? "is|=" : "is";
      this._define_var_inline_bucle = level >= 7;
      this._define_var_by_for = level >= 10;
      this._define_functions = level >= 12;
      this._define_fun_with = level >= 13;
      this._return_fun = level >= 14;
  
      this.tokens = [];
      this.names = {};
    }

    clean() {
        this.tokens = [];
        this.names = {};
    }
  
    analizeLine(text, lineNumber) {
        // troba la posició del primer caràcter no espaiat de la línia
        const firstNoSpaceChar = text.search(/[^ ]/);
        const specialComment = text.search("#!");
        const textEmptyOrComment = firstNoSpaceChar === -1 || text[firstNoSpaceChar] === '#' && specialComment === -1;
  
        if (textEmptyOrComment) return; // Si la línia està buida o és un comentari, no cal fer res
        const scope = firstNoSpaceChar;
  
        // Posa a lloc les variables que s'han de setejar a la següent posició i esborra aquelles fora de l'abast
        for (const variableName in this.names) {
          if (this.names[variableName].scope === undefined) {
            this.names[variableName].scope = scope;
            continue;
          }
  
          if (this._hasScopes && scope < this.names[variableName].scope) {
            // TODO: NO s'ha de borrar el nom de la variable si el scope és més petit que el de la variable (... o sí?)
            // De fet, a l'scope de funcions s'ha de borrar SEGUR
            // A la resta no és bona praxis, però no és incorrecte
            delete this.names[variableName];
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
  
          const subtype = varDefinitionType(text,this._hasQuotes, this._define_var_operator); 

          if (!this.names[variableName]) 
            this.names[variableName] = { scope: scope, type: 'variable', def_line: lineNumber, defChar: startChar, subtype: subtype};
          
          this.tokens.push({
            line: lineNumber,
            startChar: startChar,
            length: variableName.length,
            type: 'variable',
            modifiers: ['declaration']
          });
        }
  
        // Busca declaracions entre for i in
        if (this._define_var_by_for) {
          const forInRegex = /\bfor +([\p{L}_\d]+) +in\b/gu;
          let forMatch;
          while ((forMatch = forInRegex.exec(text)) !== null) {
            const variableName = forMatch[1];
            const startChar = forMatch.index + forMatch[0].indexOf(variableName);
  
            if (!this.names[variableName]) this.names[variableName] = { scope: undefined, type: 'variable', def_line: lineNumber, defChar: startChar };
  
            this.tokens.push({
              line: lineNumber,
              startChar: startChar,
              length: variableName.length,
              type: 'variable',
              modifiers: ['declaration']
            });
          }
        }

        // Busca declaracions de funcions 
        if (this._define_functions) {
          const funtionDeclRegex = new RegExp(' *(define) *\\b([\\p{L}_\\d]+)', 'gu'); // Regex per trobar `define funcio`
          let match2;
  
          while ((match2 = funtionDeclRegex.exec(text)) !== null) {
            const functionName = match2[2];
            const startChar = match2.index + match2[0].indexOf(functionName);
  
            if (!this.names[functionName]) this.names[functionName] = { scope: 0, type: 'function', def_line: lineNumber, defChar: startChar};
  
            this.tokens.push({
              line: lineNumber,
              startChar: startChar,
              length: functionName.length,
              type: 'function',
              modifiers: ['declaration']
            });
          }
        }

        // Busca declaracions de funcions amb with
        if (this._define_fun_with) {
          const withRegex = /define +([\p{L}_\d]+) with +(.+)/gu;
          let withMatch;
          while ((withMatch = withRegex.exec(text)) !== null) {
            const functionName = withMatch[1];
            const params = withMatch[2].split(',');
            for (const param of params) {
              const param_name = param.trim();
              const startChar = withMatch.index + withMatch[0].indexOf(param_name);
  
              if (!this.names[param_name]) this.names[param_name] = { scope: undefined, type: 'parameter', def_line: lineNumber, defChar: startChar};
  
              this.tokens.push({
                line: lineNumber,
                startChar: startChar,
                length: param_name.length,
                type: 'parameter',
                modifiers: ['declaration']
              });
            }

          // Find previous function declaration on names
          this.names[functionName].params = params;
          }
        }
  
        // Busca retorn de funcions
        if(this._return_fun){
          const returnRegex = new RegExp('^( *)return ', 'gu');
          let match3;
          while ((match3 = returnRegex.exec(text)) !== null) {
            const identation = match3[1].length;
            // Find previous function declaration on names
            const variableNames = Object.keys(this.names);
            for (let i = variableNames.length - 1; i >= 0; i--) {
              const variableName = variableNames[i];
              if (this.names[variableName].type === 'function' && this.names[variableName].def_line < lineNumber) {
                this.names[variableName].subtype = 'return';
              break;
              }
            }
            
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
  
              if (!this.names[functionName]) this.names[functionName] = { scope: 0, type: 'function', def_line: lineNumber, defChar: startChar};
  
              this.tokens.push({
                line: lineNumber,
                startChar: startChar,
                length: functionName.length,
                type: 'function',
                modifiers: ['declaration']
              });
            }
          }

        }


  
        // Busca referències a variables
        for (const variableName in this.names) {
          const referenceRegex = new RegExp(`(?<![\\p{L}_\\d])${variableName}(?![\\p{L}_\\d])`, 'gu');
  
          let refMatch;
          while ((refMatch = referenceRegex.exec(text)) !== null) {
            const startChar = refMatch.index;
  
            // Evita que es marqui com a referència a la mateixa línia de la definició
            if(this.names[variableName].def_line === lineNumber && this.names[variableName].defChar === startChar) continue; 
  
            if (enUnaLlista(text, startChar, this._hasQuotes, this._define_var_operator)) 
              continue;
  
            if (this._hasQuotes && entreCometes(text, startChar)) continue;
  
            this.tokens.push({
              line: lineNumber,
              startChar: startChar,
              length: variableName.length,
              type: 'variable',
              modifiers: ['use']
            });
          }
        }
    }

    getEntities() {
        return this.names; 
    }

    subtype(varname){
        if(!this.names[varname]) return undefined;
        return this.names[varname].subtype;
    }

    get(name) {
        return this.names[name];
    }
  }

module.exports = {
    EntityDefinitions
}
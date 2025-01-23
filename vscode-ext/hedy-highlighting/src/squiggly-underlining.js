const vscode = require('vscode');
const { entreCometes, identation, trimPosStart, trimPosEnd, getFirstWord, getLastWord } = require('./utils');
const {EntityDefinitions} = require('./definitions');


// No hi ha ni elif, ni and ni or (LEVS 5,6,7,8)
const condicionalInlineRegex = /^(if +([\p{L}_\d]+) *( is | in |=| not +in) *(".*"|[\p{L}_\d]+) |else )+(.*)$/u;
const condicionalElseInlineRegex = /(.* )(else) (.*)/;
const bucleInlineRegex = /^(repeat +([\p{L}_\d]+) +times +)(.*)$/u;

//TODO:
  // - detectar usos de llistes:
  //    - USOS NO PERMESOS
  //      - no es poden imprimir amb print/ask                    
  //      - no es poden sumar/restar/multiplicar                  FET
  //      - no es poden comparar amb ==, !=, >, <, >=, <=         FET
  //      - no es poden comparar amb is
  //    - USOS EXCLUSIUS:
  //     - add ___ to <llista>                       FET
  //     - remove ___ from <llista>                  FET
  //     - <llista> at random                        FET
  //     - ____ in <llista>                          FET
  // - detectar usos cometes (quan són necessaries) i quan no
// TODO: A partir nivell 14, es pot fer una crida des d'una funció a una altra funció que retorni un valor
// TODO: Detectar : al final de la línia quan calgui (L17)
// TODO: A nivell 14 == enlloc de = (WARN)


class Comand{
    constructor(nom, validAfter=[], commonErrors=[], deprecated=false){
        this.nom = nom;
        this.begining = validAfter.length === 0;
        this.validAfter = validAfter;
        this.deprecated = deprecated;
        this.isSymbol = nom.match("^[a-z]") === null;
        this.rnom = nom.replace(/[+*]/g, '\\$&');
        this.commonErrors = commonErrors;
    }
}

class Sintagma{
    constructor(line, partial, code, identation, tag){
        this.line = line;
        this.partial = partial;
        this.code = code;
        this.identation = identation;
        this.tag = tag;
        this.tokens = [];
    }

    addToken(token){
        this.tokens.push(token);
    }
}

class History{
    constructor(){
        this.past = [];
        this._partialcount = 0;
        this._definedScopeIdentation = -1; //Nombre de caràcters definits per a identar
        this._scopes = [0];
    }

    /*
    * Es crida un cop per cada sintagma (part de la frase) que es vol analitzar
    * Només en els inline es diferencia de les línies senceres
    */
    add(code, identation, lineNumber){
      let tag = "action";
      if(code.startsWith("if")) tag = "condition";
      else if(code.startsWith("else")) tag = "not_condition";
      else if(code.startsWith("repeat")|| code.startsWith("for") || code.startsWith("while")) tag = "bucle";
      else if(code.startsWith("define")) tag = "function_definition";

      if(this.last() !== undefined && this.last().line === lineNumber)
        this._partialcount++;
      else
        this._partialcount = 0;

      if(identation > 0 && this._definedScopeIdentation === -1) 
        this._definedScopeIdentation = identation; // Defineix la identació dels scopes

      if(identation > this._scopes[this._scopes.length - 1]){
        this._scopes.push(identation);
      }
      else if (identation < this._scopes[this._scopes.length - 1]){
        // Borra tots els scopes que ja no són vàlids
        while(identation < this._scopes[this._scopes.length - 1]){
          this._scopes.pop();
        }
      }
      
      this.past.push(new Sintagma(lineNumber, this._partialcount, code, identation, tag));
    }

    /* 
    * Retorna l'últim sintagma
     */
    last(){
      if(this.past.length === 0) return undefined;
      return this.past[this.past.length - 1];
    }

    /*
    * Es crida per afegir un token a la llista de tokens de l'últim sintagma
    * Un token és una paraula que s'ha reconegut com a comanda vàlida
    */
    addToken(token){
      this.last().addToken(token);
    }

    cercaIf(searchScoped=false, onScope=-1){
        // Cerca l'últim if. Navegant enrere s'ha de trobar un condition abans que 2 o més actions.
        let countActions = 0;
        for(let i = this.past.length - 2; i >= 0; i--){ // A tenir en compte que es comprova un cop ja hi ha la línia actual (per xo el -2)
          const sintagma = this.past[i];

          if(searchScoped && sintagma.identation !== onScope) continue;
          if(sintagma.tag === "condition") return true;
          if(sintagma.tag === "not_condition") return false;
          if(sintagma.tag === "action") countActions++;
          if(countActions >= 2) return false;
        }
        return false;
    }

    comprovaScope(identation){
      // Hi ha d'haver una condition//not_condition o un bucle a l'scope anterior
      // La separació entre scopes es manté

      const identPast = this.last() !== undefined ? this.last().identation : 0;
      const tagPast = this.last() !== undefined ? this.last().tag : "action";
      const pastIdentable = tagPast === "condition" || tagPast === "not_condition" || tagPast === "bucle" || tagPast === "function_definition";

      // L'identació ha de se múltiple de la definida
      if(identation > 0  && this._definedScopeIdentation !== -1 && identation % this._definedScopeIdentation !== 0)
        return false; 

      if(identation === identPast) {
        if(pastIdentable) return false;
        return true;
      }
      else if(identation > identPast){
        if(pastIdentable) return true;
        return false;
      }
      else { // identation < identPast
        if(this._scopes.includes(identation)) return true;
        return false;
      }
    }

    isScopeRecursive(identation){
      const identPast = this.last() !== undefined ? this.last().identation : 0;

      // Augmentem l'scope però aquest ja té un scope anterior
      if(identation>identPast && this._scopes.length > 1) return true;
      return false;
    }
}

class ComandesHedy{
    constructor(level){
      this.history = new History();
      this.entities = new EntityDefinitions(level);
      this.level = level;
      this.comandes = [new Comand("play"), new Comand("turn"), new Comand("forward"), new Comand("color")];
      this._usesCometes = level > 3;
      this._defineVarOp = level >= 6 ? "is|=" : "is";
      this._conditionalInline = level >= 5 && level < 8;
      this._usesScope = level >= 8;
      this._scopeRecursive = level >= 9;
      this._bucleInline = level == 7;
      let beforeDef = "^";
      if (this._bucleInline)
        beforeDef = "(?:^|\\btimes\\b)";

      this._declarationRegex = new RegExp(`${beforeDef} *\\b([\\p{L}_\\d]+)\\s*( ${this._defineVarOp})`, 'u'); // Regex per trobar `var is|=`
      
      const varDefCE = [{
        when: "invalid",
        before: /[\p{L}_\d] +[\p{L}_\d]/gu,
        highlight: "before",
        message: "Per definir una variable només pots fer servir una paraula",
        severity: "error"
      }];

      const isCE6 = [ {
        when: "valid",
        highlight: "command",
        after: /(?!pressed)/g,
        message: "És més recomanable fer servir '=' enlloc de 'is'.",
        severity: "warning"
      }, ...varDefCE];

      const noCometesCE = [{
        when: "valid",
        after: /^(["']).*\1/g,
        message: "En aquest nivell no calen cometes pels textos",
        highlight: "after",
        severity: "warning"
      }];

      const fromtoCE = [{
        notlist: "after",
        before: /(add|remove)\s/g,
        when: "valid",
        message: "Després de 'add to' o 'remove from' cal una llista",
        highlight: "after_word",
        severity: "warning",
      },
      {
        list: "before",
        before: /(add|remove)\s/g,
        when: "valid",
        message: "El format correcte és 'add <item> to <llista>' o 'remove <item> from <llista>'. No pot haver-hi una llista al lloc de l'item.",
        highlight: "before_word",
        severity: "warning",
      }];

      const atRandomCE = [{
        notlist: "before",
        when: "valid",
        message: "Abans de 'at random' cal una llista",
        highlight: "before_word",
        severity: "warning",
      }];

      const inCE = [{
        notlist: "after",
        after: /^(?!range)/g,
        when: "valid",
        message: "Després de 'in' cal una llista",
        highlight: "after_word",
        severity: "warning",
      },
      {
        list: "before",
        when: "valid",
        message: "Abans de 'in' no pot haver-hi una llista",
        highlight: "before_word",
        severity: "warning",
      }];

      const operatorsCE = [{
        list: "before",
        when: "valid",
        message: "Abans d'una operació només pot haver-hi un número o una variable",
        highlight: "before_word",
        severity: "warning"
      },
      {
        list: "after",
        when: "valid",
        message: "Després d'una operació només pot haver-hi un número o una variable",
        highlight: "after_word",
        severity: "warning"
      }];

      const equalCE14 = [ {
        before: /^(if|while|for|elif)/,
        after: /^(?!=)/g,
        when: "valid",
        message: "En aquest nivell s'ha de fer servir '==' enlloc de '='",
        highlight: "command",
        severity: "warning"
      }, ...varDefCE];
      
      this.comandes.push(new Comand("print", [], level < 4 ? noCometesCE: []));

      if (level == 1){
        this.comandes.push(new Comand("ask", [], noCometesCE));
        this.comandes.push(new Comand("echo", [], noCometesCE));
      }

      if (level >= 2){
        if (level < 5) this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+ +"], varDefCE));
        if (level < 6) this.comandes.push(new Comand("ask", ["^[\\p{L}_\\d]+ +is +"], level < 4 ? noCometesCE: []));

        this.comandes.push(new Comand("sleep"));
        this.comandes.push(new Comand("echo", [], [], true));
        this.comandes.push(new Comand("right", ["^turn +"], [], true));
        this.comandes.push(new Comand("left", ["^turn +"], [], true));
      }

      if (level >= 3){
        this.comandes.push(new Comand("remove"));
        this.comandes.push(new Comand("from", ["^remove .*"], fromtoCE));
        this.comandes.push(new Comand("add"));
        if(level < 11) this.comandes.push(new Comand("to", ["^add .*"], fromtoCE));
        if(level < 16) this.comandes.push(new Comand("at", ["[\\p{L}_\\d]+ +"], atRandomCE)); // TODO deprecar quan toqui
        if(level < 16) this.comandes.push(new Comand("random", ["at +"])); // TODO deprecar quan toqui
      }

      if (level >= 4){
        this.comandes.push(new Comand("clear"));
      }

      if (level >= 5){
        this.comandes.push(new Comand("if", [], [{
          when: "valid",
          after: /([\p{L}_\d]+)( +is +| *= *)\1/gu,
          highlight: "after",
          message: "No té massa sentit comparar dos cops el mateix",
          severity: "warning"
        }]));
        this.comandes.push(new Comand("else", [], [{
          special_else: true,
          when: "valid",
          message: "La comanda 'else' espera que s'hagi usat 'if' anteriorment"
        }])); // TODO ajustar funcionament regex
        if (level < 6) this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+ +", "^if .*"], varDefCE));
        if (level < 17) this.comandes.push(new Comand("pressed", ["^if .*is.*"])); // TODO deprecar quan toqui
        if (level < 17) this.comandes.push(new Comand("not", ["^if .*"]));
        if (level < 10) this.comandes.push(new Comand("in", ["^if .*"]));
      }

      if (level >= 6){
        if(level < 17) this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+ +", "^if .*"], isCE6));
        if (level < 14) this.comandes.push(new Comand("=", ["^[\\p{L}_\\d]+ *", "^if .*"], varDefCE));
        this.comandes.push(new Comand("ask", ["^[\\p{L}_\\d]+( +is +| *= *)"]));
        this.comandes.push(new Comand("+", [".+"], operatorsCE));
        this.comandes.push(new Comand("-", [".+"], operatorsCE));
        this.comandes.push(new Comand("*", [".+"], operatorsCE));
        this.comandes.push(new Comand("/", [".+"], operatorsCE));
      }

      if (level >= 7){
        this.comandes.push(new Comand("repeat"));
        this.comandes.push(new Comand("times", ["^repeat.*"]));
      }

      if (level >= 10){
        this.comandes.push(new Comand("for"));
        if (level < 17) this.comandes.push(new Comand("in", ["^if .*", "^for.*"], inCE));
      }

      if (level >= 11){
        this.comandes.push(new Comand("for"));
        this.comandes.push(new Comand("range", ["in +"]));
        this.comandes.push(new Comand("to", ["^add .*", "range.*"], fromtoCE));
      }

      if (level >= 12){
        this.comandes.push(new Comand("define"));
        this.comandes.push(new Comand("call"));
      }

      if (level >= 13){
        this.comandes.push(new Comand("with", ["^call.*", "^define.*"]));
        if (level < 17) this.comandes.push(new Comand("and", ["^if .*"]));
        if (level < 17) this.comandes.push(new Comand("or", ["^if .*"]));
      }

      if (level >= 14){
        if (level < 17) this.comandes.push(new Comand("=", ["^[\\p{L}_\\d]+ *", "^if .*"], equalCE14));
        this.comandes.push(new Comand("return"));
        this.comandes.push(new Comand(">", [".+"], operatorsCE));
        this.comandes.push(new Comand("<", [".+"], operatorsCE));
        this.comandes.push(new Comand(">=", [".+"], operatorsCE));
        this.comandes.push(new Comand("<=", [".+"], operatorsCE));
        this.comandes.push(new Comand("==", [".+"], operatorsCE));
        this.comandes.push(new Comand("!=", [".+"], operatorsCE));
      }

      if (level >= 15){
        this.comandes.push(new Comand("while"));
      }

      if(level >= 16){
        this.comandes.push(new Comand("random", ["\\[ *"], atRandomCE));
      }

      if (level >= 17){
        this.comandes.push(new Comand("elif")); // TODO ajustar funcionament regex
        this.comandes.push(new Comand("=", ["^[\\p{L}_\\d]+ *", "^if .*", "^elif .*"]), varDefCE);
        this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+ +", "^if .*", "^elif .*"]), varDefCE);
        this.comandes.push(new Comand("pressed", ["^if .*is.*", "^elif .*is.*"])); // TODO deprecar quan toqui
        this.comandes.push(new Comand("not", ["^if .*", "^elif .*"]));
        this.comandes.push(new Comand("in", ["^if .*", "^elif .*" ,"^for.*"]));
        this.comandes.push(new Comand("and", ["^if .*", "^elif .*"]));
        this.comandes.push(new Comand("or", ["^if .*", "^elif .*"]));
      }

      this._comandesInicialsRegex = new RegExp("^(" + this._inicialsStr() + ")", 'gu');
    }

    _inicialsStr(){
        return this._inicials().join("|");
    }

    _inicials(){
        return this.comandes.filter(comand => comand.begining && !comand.deprecated).map(comand => comand.nom);
    }

    checkErrors(line, lineNumber){
      const identationLength = identation(line);
      const lineTrim = line.trim();
      if(lineTrim === "") return [];
      this.entities.analizeLine(line, lineNumber);
      return this._errorsOnPhrase(lineTrim, identationLength, lineNumber);
    }

    _errorsOnPhrase(lineTrim, identationLength, lineNumber){
      // mira si es un bucle inline
      const bucle = this._bucleInline? bucleInlineRegex.exec(lineTrim) : null;

      // Mira si és un condicional 
      const condicional = this._conditionalInline? condicionalInlineRegex.exec(lineTrim) : null;

      // Mira si és un else inline
      const elseInline = this._conditionalInline? condicionalElseInlineRegex.exec(lineTrim) : null;

      if (bucle !== null){
        const bucledef = bucle[1];
        const action = bucle[3];

        let res = this._errorsOnSintagma(bucledef, identationLength, lineNumber);
        if(res.length > 0) return res;

        const innerIdentation = identation(action);
        res = this._errorsOnPhrase(action.trim(), innerIdentation+identationLength+bucledef.length, lineNumber);

        if(res.length > 0 ) return res;
      }
      else if (condicional !== null){
          const condition = condicional[1];
          const action = condicional[5];

          let res = this._errorsOnSintagma(condition, identationLength, lineNumber);
          if(res.length > 0) return res;

          const innerIdentation = identation(action);
          res = this._errorsOnPhrase(action.trim(), innerIdentation+identationLength+condition.length, lineNumber);
          if(res.length > 0 ) return res;
      }
      else if (elseInline !== null){
        const actionif = elseInline[1];
        const elseword = elseInline[2];
        const actionelse = elseInline[3];

        let res = this._errorsOnPhrase(actionif, identationLength, lineNumber);
        if(res.length > 0) return res;

        res = this._errorsOnSintagma(elseword, identationLength+actionif.length, lineNumber);
        if(res.length > 0) return res;

        const innerIdentation = identation(actionelse);
        res = this._errorsOnPhrase(actionelse.trim(), innerIdentation+identationLength+actionif.length+elseword.length, lineNumber);
        if(res.length > 0 ) return res;
      }
      else {
          return this._errorsOnSintagma(lineTrim, identationLength, lineNumber);
      }

      return [];
    }


    _errorsOnSintagma(lineTrim, identationLength, lineNumber){
      const errorsFound = [];

      // Skip empty lines
      if (lineTrim === "") return [];

      let errorMalInici = true;

      if(this.level > 1 && lineTrim.match(this._declarationRegex))
        errorMalInici = false;
  
      if (lineTrim.match(this._comandesInicialsRegex)) 
        errorMalInici = false;
  
      if (errorMalInici){
        let message = ""
        const firstWord = lineTrim.split(" ")[0];

        if (this._inicials().includes(firstWord.toLowerCase()))
            message = "Recorda que les comandes s'escriuen en minúscules";
        else if (firstWord.toLowerCase() === "ask")
            message = "Abans d'una comanda ask cal declarar una variable";
        else {
            if (this._level == 1)
                message = "La línia ha de començar per una comanda vàlida";
            if (this.level > 5 && this.level < 8)
                message = "S'ha de començar amb una comanda vàlida o amb una declaració de variable";
            else
                message = "La línia ha de començar per una comanda vàlida o amb una declaració de variable";
        }

        errorsFound.push({
            comand: firstWord,
            message: message,
            start: identationLength,
            end: identationLength + firstWord.length,
            severity: "error"
        });
      }

      // Comprova identació.
      if(this._usesScope && !this.history.comprovaScope(identationLength)){
        errorsFound.push({
          comand: "scope",
          message: "La identació no és correcta. Després d'un bucle o condició cal indentar. Només en aquests casos.\n"
                 + "Recorda que has de ser consistent amb la indentació, cal mantenir sempre la mateixa quantitat d'espais per nivell",
          start: 0,
          end: identationLength,
          severity: "error"
        });
      }
      else if(this._usesScope && !this._scopeRecursive && this.history.isScopeRecursive(identationLength)){
        errorsFound.push({
          comand: "scope",
          message: "En aquest nivell encara no es pot definir un bucle/condició dins un altre bucle/condició. Només es permeten bucles/condicions independents",
          start: 0,
          end: identationLength,
          severity: "error"
        });

      }

      this.history.add(lineTrim, identationLength, lineNumber);
      const comandError = this._searchCommandsErrors(lineTrim, identationLength);
      if (comandError.length > 0) errorsFound.push(...comandError);
      return errorsFound;
    }

    _searchCommandsErrors(lineTrim, identationLength){
      const errorsFound = [];

      for (let i = 0; i < this.comandes.length; i++){
        const comand = this.comandes[i];

        // si és simbol no cal comprovar espaiada
        const pos = comand.isSymbol ? 
          lineTrim.search(comand.rnom) 
          : lineTrim.search(new RegExp(`\\b${comand.rnom}\\b`));
        
        // Si no hi ha la comanda
        if (pos === -1) continue;

        // O si aquesta està entre cometes
        if(this._usesCometes && entreCometes(lineTrim, pos)) continue;

        const beforeAndCommand = lineTrim.substring(0, pos + comand.nom.length);
        const beforeComand = lineTrim.substring(0, pos);
        const afterComand = lineTrim.substring(trimPosStart(lineTrim, pos + comand.nom.length));

        let contextValid = false;
        let errormessage = `La comanda '${comand.nom}' no es pot fer servir en aquest context`;

        if(!this._usesCometes &&  beforeComand.match(/(print|ask|echo) +/)) // Després de print, ask o echo tot és string i no comandes
          continue;
        
        if(comand.begining){
          contextValid = lineTrim.startsWith(comand.nom);
          errormessage = `La comanda '${comand.nom}' ha d'anar al començament`;
        }
        else{
          for (let j = 0; j < comand.validAfter.length; j++){
            const regex = new RegExp(comand.validAfter[j]+comand.rnom, 'gu');

            if (beforeAndCommand.match(regex)){
                contextValid = true;
                break;  
            }
          }
      }

      let customError = false;

      for (let error of comand.commonErrors){
        if(comand.deprecated) continue;
        if(error.when === "valid" && !contextValid || error.when === "invalid" && contextValid) continue;

        let errorFound = true;

        if(error.match) errorFound &&= lineTrim.match(error.match) !== null;
        //console.log("match: ", errorFound)
        if(error.before) errorFound &&= beforeComand.match(error.before) !== null
        //console.log("before: ", errorFound)  
        if(error.after) errorFound &&= afterComand.match(error.after) !== null
        //console.log("after: ", errorFound)
        if(error.list) errorFound &&= this.entities.isList(error.list === "before" ? getLastWord(beforeComand): getFirstWord(afterComand));
        //console.log("list: ", errorFound)
        if(error.notlist) errorFound &&= !this.entities.isList(error.notlist === "before" ? getLastWord(beforeComand): getFirstWord(afterComand));
        //console.log("notlist: ", errorFound)
        if(error.special_else) errorFound &&= !this.history.cercaIf(this._usesScope, identationLength);
        //console.log("special_else: ", errorFound)

        if (errorFound){
          let start = pos 
          let end = pos + comand.nom.length;

          if(error.highlight === "before_word"){
              const word = getLastWord(beforeComand);
              start = beforeComand.lastIndexOf(word);
              end = start + word.length;
          }
          else if(error.highlight === "after_word"){
            const word = getFirstWord(afterComand);
            start = pos + comand.nom.length + afterComand.indexOf(word) +1;
            end = start + word.length;
          }
          else if(error.highlight === "before"){
              start = 0;
              end = beforeComand.length;
          }
          else if(error.highlight === "after"){
              start = trimPosStart(lineTrim, pos + comand.nom.length);
              end = trimPosEnd(lineTrim, lineTrim.length);
          }
          else if(error.highlight === "command"){
              start = pos;
              end = pos + comand.nom.length;
          }

          errorsFound.push({
            comand: comand.nom,
            message: error.message,
            start: start + identationLength,
            end: end + identationLength,
            severity: error.severity || "error"
          });

          customError = true;
        }
      }

      if(!customError && !contextValid){
        errorsFound.push({
          comand: comand.nom,
          message: errormessage,
          start: pos + identationLength,
          end: pos + identationLength + comand.nom.length,
          severity: "error"
        });
      }

        if(!customError && contextValid && comand.deprecated){
          errorsFound.push({
            comand: comand.nom,
            message: `La comanda '${comand.nom}' ja no es pot fer servir en aquest nivell`,
            start: pos + identationLength,
            end: pos + identationLength + comand.nom.length,
            severity: "error"
          });
        }

        if(contextValid && !comand.deprecated)
          this.history.addToken(comand.nom); 
      }

      return errorsFound;
    }
}

function onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document){
    const diagnostics = [];
    const hedy = new ComandesHedy(hedyLevel);

    for(let i = 0; i < lines.length; i++){
      // Esborra qualsevol comentari a partir de #
      const line = lines[i].split("#")[0];
      const errors = hedy.checkErrors(line, i);
      if (errors !== null){
        for (let error of errors){
          const severity = error.severity === "warning" ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error;
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
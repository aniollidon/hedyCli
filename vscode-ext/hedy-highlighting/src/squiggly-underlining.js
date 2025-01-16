const vscode = require('vscode');
const { entreCometes, enUnaLlista, identation } = require('./utils');

// No hi ha ni elif, ni and ni or (LEVS 5,6,7,8)
const condicionalInlineRegex = /^(if[ \\t]+([\p{L}_\d]+)[ \\t]*( is| in|=| not[\t ]+in)[\t ](".*"|[\p{L}_\d]+)[ \t]|else[ \\t])+(.*)$/u;
const condicionalElseInlineRegex = /(.*)[ \t](else)[ \t](.*)/;
const bucleInlineRegex = /^(repeat[ \\t]+([\p{L}_\d]+)[ \\t]+times[ \\t]+)(.*)$/u;

//TODO:
  // - random sense at
  // - detectar usos de llistes:
  //    - USOS NO PERMESOS
  //      - no es poden imprimir amb print/ask
  //      - no es poden sumar/restar/multiplicar
  //      - no es poden comparar amb ==, !=, >, <, >=, <=
  //      - no es poden comparar amb is
  //    - USOS EXCLUSIUS:
  //     - add ___ to <llista>
  //     - remove ___ from <llista>
  //     - <llista> at random
  //     - ____ in <llista>
  // - detectar usos cometes (quan són necessaries)


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

class History{
    constructor(){
        this.past = {};
        this._linecount = -1;
        this._partialcount = 0;
    }

    /* 
    * Es crida un cop per cada línia sencera (frase)
    */
    add(line, identation){
      this._linecount++;
      this._partialcount = -1;

        this.past[this._linecount] = {
          line: line, 
          identation: identation,
          partials: []
        };

      console.log("add line", line, this._linecount, this._partialcount)
    }

    /*
    * Es crida un cop per cada sintagma (part de la frase) que es vol analitzar
    * Només en els inline es diferencia de les línies senceres
    */
    add_partial(line, identation, tag){
      this._partialcount++;
      console.log("add partial", line, this._linecount, this._partialcount)

      this.past[this._linecount].partials.push({
          counter: this._linecount, 
          partial: this._partialcount,
          line: line, 
          identation: identation,
          tag: tag,
          tokens: []});
    }

    /*
    * Es crida per afegir un token a la llista de tokens d'un sintagma.
    * Un token és una paraula que s'ha reconegut com a comanda vàlida
    */
    add_token(token){
      console.log("add token", token, this._linecount, this._partialcount)
      console.log(this.past)
      this.past[this._linecount].partials[this._partialcount].tokens.push(token);
    }

    /*
    * El passat 2 és dos sintagmes enrere
    */
    past2(){

    }
}

class ComandesHedy{
    constructor(level){
      this.history = new History();
      this.cometes = false;
      this.level = level;
      this.comandes = [new Comand("print"), new Comand("play"), new Comand("turn"), new Comand("forward"), new Comand("color")];
      this._define_var_operator = level >= 6 ? "is|=" : "is";
      this._condicional_inline = level >= 5 && level < 8;
      this._bucle_inline = level == 7;
      let before_def = "^";
      if (this._bucle_inline)
        before_def = "(?:^|\\btimes\\b)";

      this._declarationRegex = new RegExp(`${before_def}[\\t ]*\\b([\\p{L}_\\d]+)\\s*( ${this._define_var_operator})`, 'u'); // Regex per trobar `var is|=`
      
      const vardef_commonErrors = [{
        search: "before",
        match: /[\p{L}_\d][\t ]+[\p{L}_\d]/gu,
        highlight: "before",
        message: "Per definir una variable només pots fer servir una paraula"
      }];

      if (level == 1){
        this.comandes.push(new Comand("ask"));
        this.comandes.push(new Comand("echo"));
      }

      if (level >= 2){
        if (level < 5) this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+[ \\t]+"], vardef_commonErrors));
        if (level < 6) this.comandes.push(new Comand("ask", ["^[\\p{L}_\\d]+[ \\t]+is[ \\t]+"]));

        this.comandes.push(new Comand("sleep"));
        this.comandes.push(new Comand("echo", [], [], true));
        this.comandes.push(new Comand("right", ["^turn[ \\t]+"], [], true));
        this.comandes.push(new Comand("left", ["^turn[ \\t]+"], [], true));
      }

      if (level >= 3){
        this.comandes.push(new Comand("remove"));
        this.comandes.push(new Comand("from", ["^remove[ \\t].*"]));
        this.comandes.push(new Comand("add"));
        if(level < 11) this.comandes.push(new Comand("to", ["^add[ \\t].*"]));
        this.comandes.push(new Comand("at", [".+"])); // TODO deprecar quan toqui
        this.comandes.push(new Comand("random", ["at[ \\t]+"])); // TODO deprecar quan toqui
      }

      if (level >= 4){
        this.comandes.push(new Comand("clear"));
        this.cometes = true;
      }

      if (level >= 5){
        this.comandes.push(new Comand("if"));
        this.comandes.push(new Comand("else", [], [{
          search: "past2",
          token: "if",
          message: "La comanda 'else' espera que s'hagi usat 'if' anteriorment"
        }])); // TODO ajustar funcionament regex
        if (level < 17) this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+[ \\t]+", "^if[ \\t].*"], vardef_commonErrors));
        if (level < 17) this.comandes.push(new Comand("pressed", ["^if[ \\t].*is.*"])); // TODO deprecar quan toqui
        if (level < 17) this.comandes.push(new Comand("not", ["^if[ \\t].*"]));
        if (level < 10) this.comandes.push(new Comand("in", ["^if[ \\t].*"]));
      }

      if (level >= 6){
        if (level < 17) this.comandes.push(new Comand("=", ["^[\\p{L}_\\d]+[ \\t]*", "^if[ \\t].*"], vardef_commonErrors));
        this.comandes.push(new Comand("ask", ["^[\\p{L}_\\d]+([ \\t]+is[ \\t]+|[ \\t]*=[ \\t]*)"]));
        this.comandes.push(new Comand("+", [".+"]));
        this.comandes.push(new Comand("-", [".+"]));
        this.comandes.push(new Comand("+", [".+"]));
        this.comandes.push(new Comand("*", [".+"]));
      }

      if (level >= 7){
        this.comandes.push(new Comand("repeat"));
        this.comandes.push(new Comand("times", ["^repeat.*"]));
      }

      if (level >= 10){
        this.comandes.push(new Comand("for"));
        if (level < 17) this.comandes.push(new Comand("in", ["^if[ \\t].*", "^for.*"]));
      }

      if (level >= 11){
        this.comandes.push(new Comand("for"));
        this.comandes.push(new Comand("range", ["in[\\t ]+"]));
        this.comandes.push(new Comand("to", ["^add[ \\t].*", "range.*"]));
      }

      if (level >= 12){
        this.comandes.push(new Comand("define"));
        this.comandes.push(new Comand("call"));
      }

      if (level >= 13){
        this.comandes.push(new Comand("with", ["^call.*", "^define.*"]));
        if (level < 17) this.comandes.push(new Comand("and", ["^if[ \\t].*"]));
        if (level < 17) this.comandes.push(new Comand("or", ["^if[ \\t].*"]));
      }

      if (level >= 14){
        this.comandes.push(new Comand("return"));
        this.comandes.push(new Comand(">", [".+"]));
        this.comandes.push(new Comand("<", [".+"]));
        this.comandes.push(new Comand(">=", [".+"]));
        this.comandes.push(new Comand("<=", [".+"]));
        this.comandes.push(new Comand("==", [".+"]));
        this.comandes.push(new Comand("!=", [".+"]));
      }

      if (level >= 15){
        this.comandes.push(new Comand("while"));
      }

      if (level >= 17){
        this.comandes.push(new Comand("elif")); // TODO ajustar funcionament regex
        this.comandes.push(new Comand("=", ["^[\\p{L}_\\d]+[ \\t]*", "^if[ \\t].*", "^elif[ \\t].*"]), vardef_commonErrors);
        this.comandes.push(new Comand("is", ["^[\\p{L}_\\d]+[ \\t]+", "^if[ \\t].*", "^elif[ \\t].*"]), vardef_commonErrors);
        this.comandes.push(new Comand("pressed", ["^if[ \\t].*is.*", "^elif[ \\t].*is.*"])); // TODO deprecar quan toqui
        this.comandes.push(new Comand("not", ["^if[ \\t].*", "^elif[ \\t].*"]));
        this.comandes.push(new Comand("in", ["^if[ \\t].*", "^elif[ \\t].*" ,"^for.*"]));
        this.comandes.push(new Comand("and", ["^if[ \\t].*", "^elif[ \\t].*"]));
        this.comandes.push(new Comand("or", ["^if[ \\t].*", "^elif[ \\t].*"]));
      }

      this._comandesInicialsRegex = new RegExp("^(" + this._inicials_str() + ")", 'gu');
    }

    _inicials_str(){
        return this._inicials().join("|");
    }

    _inicials(){
        return this.comandes.filter(comand => comand.begining && !comand.deprecated).map(comand => comand.nom);
    }

    _inicials_deprecades(){
        return this.comandes.filter(comand => comand.begining && comand.deprecated).map(comand => comand.nom);
    }

    checkErrors(line){
      const identationLength = identation(line);
      const lineTrim = line.trim();
      if(lineTrim === "") return [];
      this.history.add(lineTrim, identationLength);
      return this._errorsOnPhrase(lineTrim, identationLength);
    }

    _errorsOnPhrase(lineTrim, identationLength){
      // mira si es un bucle inline
      const bucle = this._bucle_inline? bucleInlineRegex.exec(lineTrim) : null;

      // Mira si és un condicional 
      const condicional = this._condicional_inline? condicionalInlineRegex.exec(lineTrim) : null;

      // Mira si és un else inline
      const else_inline = this._condicional_inline? condicionalElseInlineRegex.exec(lineTrim) : null;


      console.log("_errorsOnPhrase line", lineTrim)
      console.log("_errorsOnPhrase bucle", bucle, "condicional", condicional, "else", else_inline)

      if (bucle !== null){
        const bucledef = bucle[1];
        const action = bucle[3];

        let res = this._errorsOnSintagma(bucledef, identationLength, "bucle");
        if(res.length > 0) return res;

        const inside_identation = identation(action);
        res = this._errorsOnPhrase(action.trim(), inside_identation+identationLength+bucledef.length);

        if(res.length > 0 ) return res;
      }
      else if (condicional !== null){
          const condition = condicional[1];
          const action = condicional[5];

          let res = this._errorsOnSintagma(condition, identationLength, "condition");
          if(res.length > 0) return res;

          const inside_identation = identation(action);
          res = this._errorsOnPhrase(action.trim(), inside_identation+identationLength+condition.length);
          if(res.length > 0 ) return res;
      }
      else if (else_inline !== null){
        const actionif = else_inline[1];
        const elseword = else_inline[2];
        const actionelse = else_inline[3];

        let res = this._errorsOnPhrase(actionif, identationLength);
        if(res.length > 0) return res;

        res = this._errorsOnSintagma(elseword, identationLength+actionif.length, "else");
        if(res.length > 0) return res;

        const inside_identation = identation(actionelse);
        res = this._errorsOnPhrase(actionelse.trim(), inside_identation+identationLength+actionif.length+elseword.length);
        if(res.length > 0 ) return res;
      }
      else {
          return this._errorsOnSintagma(lineTrim, identationLength, "action");
      }

      return [];
    }


    _errorsOnSintagma(lineTrim, identationLength, tag = null){
      const errors_found = [];

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
        else if (this._inicials_deprecades().includes(firstWord))
            message = "Aquesta comanda ja no es pot fer servir en aquest nivell";
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

        errors_found.push({
            comand: firstWord,
            message: message,
            start: identationLength,
            end: identationLength + firstWord.length
        });
      }

      this.history.add_partial(lineTrim, identationLength, tag);
      const comandError = this._searchCommandsErrors(lineTrim, identationLength);
      if (comandError.length > 0) errors_found.push(...comandError);
      return errors_found;
    }

    _searchCommandsErrors(lineTrim, identationLength){
      const errors_found = [];

      for (let i = 0; i < this.comandes.length; i++){
        const comand = this.comandes[i];

        // si és simbol no cal comprovar espaiada
        const pos = comand.isSymbol ? 
          lineTrim.search(comand.rnom) 
          : lineTrim.search(new RegExp(`\\b${comand.rnom}\\b`));
        

        if (pos === -1) continue;
        if(this.cometes && entreCometes(lineTrim, pos)) continue;

        const beforeComand = lineTrim.substring(0, pos + comand.nom.length);

        // Quan print o ask funcionen sense cometes tot és string i no cal comprovar les comandaes
        if(!this.cometes && beforeComand.match(/\b(print|ask)\b/gu)) continue; 
       

        let contextValid = false;
        let errormessage = `La comanda '${comand.nom}' no es pot fer servir en aquest context`;
        
        if(comand.begining){
          contextValid = lineTrim.startsWith(comand.nom);
          errormessage = `La comanda '${comand.nom}' ha d'anar al començament`;
        }
        else{
          for (let j = 0; j < comand.validAfter.length; j++){
            const regex = new RegExp(comand.validAfter[j]+comand.rnom, 'gu');

            if (beforeComand.match(regex)){
                contextValid = true;
                break;  
            }
          }
      }

        if(!contextValid && !comand.deprecated){
          let customError = false;

          for (let error of comand.commonErrors){
            if (! error.search
                || error.search === "before" && beforeComand.match(error.match)
                || error.search === "line" && lineTrim.match(error.match)
                || error.search === "after" && lineTrim.substring(pos).match(error.match)
              ){
              let start =  pos 
              let end = pos + comand.nom.length;

              if(error.highlight === "before"){
                  start = 0;
                  end = beforeComand.length - comand.nom.length;
              }
              else if(error.highlight === "after"){
                  start = pos + comand.nom.length;
                  end = lineTrim.length;
              }

              errors_found.push({
                comand: comand.nom,
                message: error.message,
                start: start + identationLength,
                end: end + identationLength
              });

              customError = true;
            }
          }

          if(!customError)
            errors_found.push({
              comand: comand.nom,
              message: errormessage,
              start: pos + identationLength,
              end: pos + identationLength + comand.nom.length
            });
        }

        if(contextValid && comand.deprecated){
          errors_found.push({
            comand: comand.nom,
            message: `La comanda '${comand.nom}' ja no es pot fer servir en aquest nivell`,
            start: pos + identationLength,
            end: pos + identationLength + comand.nom.length
          });
        }

        if(contextValid && !comand.deprecated)
          this.history.add_token(comand.nom); 
      }

      return errors_found;
    }
}

function onChangeHedyCode(lines, hedyLevel, diagnosticCollection, document){
    const diagnostics = [];
    const hedy = new ComandesHedy(hedyLevel);

    for(let i = 0; i < lines.length; i++){
      // Esborra qualsevol comentari a partir de #
      const line = lines[i].split("#")[0];
      const errors = hedy.checkErrors(line);
      if (errors !== null){
        for (let error of errors){
          diagnostics.push(new vscode.Diagnostic(new vscode.Range(i, error.start, i, error.end), error.message, vscode.DiagnosticSeverity.Error));
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
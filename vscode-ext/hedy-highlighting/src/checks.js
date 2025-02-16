const {
  identation,
  separarParaules,
  detectTypeConstant,
  detectMath,
  detectFuctionUsages,
  detectComparations,
  validType
} = require("./utils");
const { EntityDefinitions } = require("./definitions");
const { hedyCommands, specificHedyErrors, hedyGeneralSintaxis } = require("./hedy-sintaxis");
const { HHError } = require("./errors");

// No hi ha ni elif, ni and ni or (LEVS 5,6,7,8)
const condicionalInlineRegex =
  /^(if +([\p{L}_\d]+) *( is | in |=| not +in ) *(".*"|[\p{L}_\d]+) |else )+(.*)$/u;
const condicionalElseInlineRegex = /(.* )(else) (.*)/;
const bucleInlineRegex = /^(repeat +([\p{L}_\d]+) +times +)(.*)$/u;

class Sintagma {
  constructor(line, partial, code, identation, tag) {
    this.line = line;
    this.partial = partial;
    this.code = code;
    this.identation = identation;
    this.tag = tag;
    this.tokens = [];
  }

  addToken(token, pos) {
    this.tokens[pos] = token;
  }

  get(token) {
    // Search for the token in the sintagma
    for (let i = 0; i < this.tokens.length; i++) {
      if (this.tokens[i] === token) return { token: token, pos: i };
    }
    return undefined;
  }
}

class History {
  constructor() {
    this.past = [];
    this._partialcount = 0;
    this._definedScopeIdentation = -1; //Nombre de caràcters definits per a identar
    this._scopes = [0];
  }

  /*
   * Es crida un cop per cada sintagma (part de la frase) que es vol analitzar
   * només en els inline es diferencia de les línies senceres
   */
  add(code, identation, lineNumber) {
    let tag = "action";
    if (code.startsWith("if")) tag = "condition";
    else if (code.startsWith("else")) tag = "not_condition";
    else if (
      code.startsWith("repeat") ||
      code.startsWith("for") ||
      code.startsWith("while")
    )
      tag = "bucle";
    else if (code.startsWith("define")) tag = "function_definition";

    if (this.last() !== undefined && this.last().line === lineNumber)
      this._partialcount++;
    else this._partialcount = 0;

    if (identation > 0 && this._definedScopeIdentation === -1)
      this._definedScopeIdentation = identation; // Defineix la identació dels scopes

    if (identation > this._scopes[this._scopes.length - 1]) {
      this._scopes.push(identation);
    } else if (identation < this._scopes[this._scopes.length - 1]) {
      // Borra tots els scopes que ja no són vàlids
      while (identation < this._scopes[this._scopes.length - 1]) {
        this._scopes.pop();
      }
    }

    this.past.push(
      new Sintagma(lineNumber, this._partialcount, code, identation, tag)
    );
  }

  /*
   * Retorna l'últim sintagma
   */
  last() {
    if (this.past.length === 0) return undefined;
    return this.past[this.past.length - 1];
  }

  /*
   * Es crida per afegir un token a la llista de tokens de l'últim sintagma
   * Un token és una paraula que s'ha reconegut com a comanda vàlida
   */
  addToken(token, start) {
    this.last().addToken(token, start);
  }

  cercaIf(searchScoped = false, onScope = -1) {
    // Cerca l'últim if. Navegant enrere s'ha de trobar un condition abans que 2 o més actions.
    let countActions = 0;
    for (let i = this.past.length - 2; i >= 0; i--) {
      // A tenir en compte que es comprova un cop ja hi ha la línia actual (per xo el -2)
      const sintagma = this.past[i];

      if (searchScoped && sintagma.identation !== onScope) continue;
      if (sintagma.tag === "condition") return true;
      if (sintagma.tag === "not_condition") return false;
      if (sintagma.tag === "action") countActions++;
      if (countActions >= 2) return false;
    }
    return false;
  }

  comprovaScope(identation) {
    // Hi ha d'haver una condition//not_condition o un bucle a l'scope anterior
    // La separació entre scopes es manté

    const identPast = this.last() !== undefined ? this.last().identation : 0;
    const tagPast = this.last() !== undefined ? this.last().tag : "action";
    const pastIdentable =
      tagPast === "condition" ||
      tagPast === "not_condition" ||
      tagPast === "bucle" ||
      tagPast === "function_definition";

    // L'identació ha de se múltiple de la definida
    if (
      identation > 0 &&
      this._definedScopeIdentation !== -1 &&
      identation % this._definedScopeIdentation !== 0
    )
      return false;

    if (identation === identPast) {
      if (pastIdentable) return false;
      return true;
    } else if (identation > identPast) {
      if (pastIdentable) return true;
      return false;
    } else {
      // identation < identPast
      if (this._scopes.includes(identation)) return true;
      return false;
    }
  }

  isScopeRecursive(identation) {
    const identPast = this.last() !== undefined ? this.last().identation : 0;

    // Augmentem l'scope però aquest ja té un scope anterior
    if (identation > identPast && this._scopes.length > 1) return true;
    return false;
  }
}

class CheckHedy {
  constructor(level) {
    this.history = new History();
    this.entities = new EntityDefinitions(level);
    this.level = level;
    this._usesCometesText = level > 3;
    this._defineVarOp = level >= 6 ? "is|=" : "is";
    this._conditionalInline = level >= 5 && level < 8;
    this._usesScope = level >= 8;
    this._scopeRecursive = level >= 9;
    this._bucleInline = level == 7;
    this._usesCometesArreu = level >= 12;
    this._decimals = level >= 12;
    this._atrandom = level >= 3 && level <= 15;
    this._functions = level >= 12;
    let beforeDef = "^";
    if (this._bucleInline) beforeDef = "(?:^|\\btimes\\b)";

    this._declarationRegex = new RegExp(
      `${beforeDef} *\\b([\\p{L}_\\d]+)\\s*( ${this._defineVarOp})`,
      "u"
    ); // Regex per trobar `var is|=`
  }

  analyse(line, lineNumber) {
    const identationLength = identation(line);
    const lineTrim = line.trim();
    if (lineTrim === "") return [];
    this.entities.analizeLine(line, lineNumber);
    return this._analysePhrase(lineTrim, identationLength, lineNumber);
  }

  _analysePhrase(lineTrim, identationLength, lineNumber) {
    // mira si es un bucle inline
    const bucle = this._bucleInline ? bucleInlineRegex.exec(lineTrim) : null;

    // Mira si és un condicional
    const condicional = this._conditionalInline
      ? condicionalInlineRegex.exec(lineTrim)
      : null;

    // Mira si és un else inline
    const elseInline = this._conditionalInline
      ? condicionalElseInlineRegex.exec(lineTrim)
      : null;

    if (bucle !== null) {
      const bucledef = bucle[1];
      const action = bucle[3];

      let res = this._analyseSintagma(bucledef, identationLength, lineNumber);
      if (res.length > 0) return res;

      const innerIdentation = identation(action);
      res = this._analysePhrase(
        action.trim(),
        innerIdentation + identationLength + bucledef.length,
        lineNumber
      );

      if (res.length > 0) return res;
    } else if (condicional !== null) {
      const condition = condicional[1];
      const action = condicional[5];

      let res = this._analyseSintagma(condition, identationLength, lineNumber);
      if (res.length > 0) return res;

      const innerIdentation = identation(action);
      res = this._analysePhrase(
        action.trim(),
        innerIdentation + identationLength + condition.length,
        lineNumber
      );
      if (res.length > 0) return res;
    } else if (elseInline !== null) {
      const actionif = elseInline[1];
      const elseword = elseInline[2];
      const actionelse = elseInline[3];

      let res = this._analysePhrase(actionif, identationLength, lineNumber);
      if (res.length > 0) return res;

      res = this._analyseSintagma(
        elseword,
        identationLength + actionif.length,
        lineNumber
      );
      if (res.length > 0) return res;

      const innerIdentation = identation(actionelse);
      res = this._analysePhrase(
        actionelse.trim(),
        innerIdentation + identationLength + actionif.length + elseword.length,
        lineNumber
      );
      if (res.length > 0) return res;
    } else {
      return this._analyseSintagma(lineTrim, identationLength, lineNumber);
    }

    return [];
  }

  _analyseSintagma(lineTrim, identationLength, lineNumber) {
    const errorsFound = [];

    // Skip empty lines
    if (lineTrim === "") return [];

    // Comprova identació.
    if (this._usesScope && !this.history.comprovaScope(identationLength)) {
      errorsFound.push(
        new HHError("identation", "hy-identation", 0, identationLength)
      );
    } else if (
      this._usesScope &&
      !this._scopeRecursive &&
      this.history.isScopeRecursive(identationLength)
    ) {
      errorsFound.push(
        new HHError(
          "identation",
          "hy-identation-multiple-unavailable",
          0,
          identationLength
        )
      );
    }

    this.history.add(lineTrim, identationLength, lineNumber); //HMM

    const words = this._tagWords(lineTrim, identationLength);

    console.log("words: ", words);
    let errors = this._searchMorfoSyntaxisErrors(words);
    if (errors.length > 0) errorsFound.push(...errors);

    errors = this._searchSpecificErrors(words);
    if (errors.length > 0) errorsFound.push(...errors);
    
    return errorsFound;
  }

  _tagCommands(words) {
    const iniciPAE =
      words[0].name === "print" ||
      words[0].name === "ask" ||
      words[0].name === "echo";

    for (let k = 0; k < words.length; k++) {
      for (let i = 0; i < hedyCommands.length; i++) {
        const command = hedyCommands[i];
        let contextValid = true;

        if (!this._usesCometesText && iniciPAE && k !== 0) continue; // Després de print, ask o echo tot és string i no comandes
 
        if (words[k].name !== command.name) {
          if(command.levelStart && command.levelStart > this.level) continue;
          if(command.levelEnd && command.levelEnd < this.level) continue;

          if(words[k].name.toLowerCase() === command.name){
            words[k].couldBe = {
              tag: command.tag,
              errorCode: "hy-to-lowercase-command"
            }}
          continue;
        }

        if (command.levelStart && command.levelStart > this.level) {
          words[k].couldBe = {
            tag: command.tag,
            errorCode: "hy-level-unavailable-yet",
          };
          continue;
        } else if (command.levelEnd && command.levelEnd < this.level) {
          words[k].couldBe = {
            tag: command.tag,
            errorCode: "hy-level-unavailable-deprecated",
          };
          continue;
        }

        if (command.atBegining && k !== 0) {
          words[k].couldBe = {
            tag: command.tag,
            errorCode: "hy-at-begining"
          };
          continue;
        }

        if (command.hasBefore) {
          const before = words
            .slice(0, k)
            .map((w) => w.name)
            .join(" ");
          contextValid &&= before.match(command.hasBefore);
        }

        if (command.hasAfter) {
          const after = words
            .slice(k + 1)
            .map((w) => w.name)
            .join(" ");
          contextValid &&= after.match(command.hasAfter);
        }

        if (contextValid) {
          words[k].tag = command.tag;
          words[k].type = "command_" + words[k].tag;
          words[k].info = command.name;
          words[k].couldBe = undefined;
          break;
        } else {
          words[k].couldBe = {
            tag: command.tag,
            errorCode: "hy-context",
          };
        }
      }
    }

    return words;
  }

  _tagWords(lineTrim, identationLength) {
    let words = separarParaules(lineTrim);

    // suma la identació a la posició de les paraules
    for (let i = 0; i < words.length; i++) {
      words[i].pos += identationLength;
    }

    if (words.length === 0) return [];

    words = this._tagCommands(words);

    // Tagging entities and constants
    for (let i = 0; i < words.length; i++) {
      const word = words[i].name;
      if (word === "") continue;

      if (!words[i].type) {
        const entity = this.entities.get(word);
        const constant = detectTypeConstant(word);

        if (entity !== undefined) {
          words[i].type = "entity_" + entity.type;
          if (words[i].type.subtype) words[i].type += "_" + entity.subtype;
          words[i].info = entity;
        } else if (constant !== undefined) {
          words[i].type = "constant_" + constant;
          words[i].info = constant;
        }
      }
    }

    // Processa la frase per trobar operacions
    words = detectMath(words);
    words = detectFuctionUsages(words, this._atrandom, this._functions);
    words = detectComparations(words);

    return words;
  }

  _searchMorfoSyntaxisErrors(words) {
    const errorsFound = [];

    for(let k = 0; k < words.length; k++){
      const word = words[k];
      const start = word.pos;
      const end = start + word.name.length;

      if(word.couldBe){
        errorsFound.push(new HHError(word.name, word.couldBe.errorCode, start, end));
        continue;
      }

      if(word.type && word.type.startsWith("command")){
        const command_def = hedyCommands.find(c => c.tag === word.tag);
        let argsForCommand = words.length;
        if(!command_def) continue;

        console.log("command_def: ", command_def, "word: ", word);

        if(command_def.elementsAfter !== undefined){

          const elementsAfter = Array.isArray(command_def.elementsAfter) ? command_def.elementsAfter : [command_def.elementsAfter];
          const minExpected = k + Math.min(...elementsAfter);
          const maxExpected = k + Math.max(...elementsAfter);
          argsForCommand = maxExpected;

          if(words.length <= minExpected){
            errorsFound.push(new HHError(word.name, "hy-command-missing-argument", start, end, minExpected - k));
          }

          // Qualsevol element després dels necessaris són erronis
          for(let j = maxExpected +1; j < words.length; j++){
            errorsFound.push(new HHError(command_def.name, "hy-command-unexpected-argument", words[j].pos, words[j].pos + words[j].name.length, maxExpected -k ));
          }
        }

        if(command_def.sintaxis){
          for(let sx = 0; sx < command_def.sintaxis.length; sx++){
            const rule = command_def.sintaxis[sx];
            if(rule.levelStart && rule.levelStart > this.level) continue;
            if(rule.levelEnd && rule.levelEnd < this.level) continue;

            for(let j= k + 1; j < argsForCommand && j < words.length; j++){
              const arg = words[j];
              const sstart = arg.pos;
              const send = sstart + arg.name.length;
              if(rule.refused && !validType(arg.type, rule.refused)) continue;
              if(rule.allowed && validType(arg.type, rule.allowed)) continue;
  
              errorsFound.push(new HHError(word.name, rule.codeerror, sstart, send));
            }
          }
        }
      }

      for (let i = 0; i < hedyGeneralSintaxis.length; i++) {
        const rule = hedyGeneralSintaxis[i];
        if(rule.levelStart && rule.levelStart > this.level) continue;
        if(rule.levelEnd && rule.levelEnd < this.level) continue;
        if(rule.position !== undefined && rule.position !== k) continue;
        if(rule.refused && !validType(word.type, rule.refused)) continue;
        if(rule.allowed && validType(word.type, rule.allowed)) continue;

        errorsFound.push(new HHError(word.name, rule.codeerror, start, end));
      }
    }

    return errorsFound;
  }

  _searchSpecificErrors(words) {
    const errorsFound = [];

    for (let i = 0; i < words.length; i++) {
      const word = words[i];

      let searchWhen = false
      let taggedCommand = undefined;
    
      if(word.type && word.type.startsWith("command")) {
        searchWhen = "valid";
        taggedCommand = word.tag;
      }
      else if(word.couldBe){
        searchWhen = "invalid";
        taggedCommand = word.couldBe.tag;
      }
      else continue;


      for(let j = 0; j < specificHedyErrors.length; j++){
        const error = specificHedyErrors[j];
        if(error.when !== searchWhen) continue;
        if(error.levelStart && error.levelStart > this.level) continue;
        if(error.levelEnd && error.levelEnd < this.level) continue;
        if(!error.commands.includes(taggedCommand)) continue;

        if(error.hasAfterCommand){
          const after = words.slice(i + 1).map(w => w.name).join(" ");
          if(!after.match(error.hasAfterCommand)) continue;
        }
        if(error.hasBeforeCommand){
          const before = words.slice(0, i).map(w => w.name).join(" ");
          if(!before.match(error.hasBeforeCommand)) continue;
        }
        if(error.list || error.notlist){
          const place = error.list ? error.list : error.notlist;
          const si = place === "before" ? i - 1 : i + 1;
          if(si < 0 || si >= words.length) continue;

          const found = words[si].type === "entity_variable" && words[si].info.subtype === "list";

          if(error.list && !found) continue;
          if(error.notlist && found) continue;
        }

        if(error.special_else && !this.history.cercaIf(this._usesScope, identationLength)) continue;

        if(error.beforeAndAfter && error.beforeAndAfter === "same"){
          if(i === 0 || i === words.length - 1) continue;
          if(words[i - 1].name !== words[i + 1].name) continue;
        }

        let start = word.pos;
        let end = start + word.name.length;

        if (error.highlight === "before_word") {
          if(i === 0) continue;
          start = words[i-1].pos;
          end = start + words[i-1].name.length;
        }
        else if (error.highlight === "after_word") {
          if(i === words.length - 1) continue;
          start = words[i+1].pos;
          end = start + words[i+1].name.length;
        }
        else if (error.highlight === "before") {
          if(i === 0) continue;
          start = words[0].pos;
          end = words[i-1].pos + words[i-1].name.length;
        }
        else if (error.highlight === "after") {
          if(i === words.length - 1) continue;
          start = words[i+1].pos;
          end = words[words.length - 1].pos + words[words.length - 1].name.length;
        }

        errorsFound.push(new HHError(word.name, error.codeerror, start, end));
        

      }
    }

    return errorsFound;
  }

}

module.exports = {
  CheckHedy,
};

const {
  identation,
  separarParaules,
  detectTypeConstant,
  detectMath,
  detectFuctionUsages,
  detectComparations,
  validType,
  compareType
} = require("./utils");
const { EntityDefinitions } = require("./definitions");
const {
  hedyCommands,
  specificHedyErrors,
  hedyGeneralSintaxis,
} = require("./hedy-sintaxis");
const { HHError, HHErrorVal, HHErrorType, HHErrorLine } = require("./errors");

// No hi ha ni elif, ni and ni or (LEVS 5,6,7,8)
const condicionalInlineRegex =
  /^(if +([\p{L}_\d]+) *( is | in |=| not +in ) *(".*"|[\p{L}_\d]+) |else )+(.*)$/u;
const condicionalElseInlineRegex = /(.* )(else) (.*)/;
const bucleInlineRegex = /^(repeat +([\p{L}_\d]+) +times +)(.*)$/u;

class Sintagma {
  constructor(linenum, partialnum, subsintagmanum, words, identation, sintagmaTag) {
    this.linenum = linenum; // Línia on es troba el sintagma
    this.partialnum = partialnum; // Número de sintagma en la mateixa línia
    this.subsintagmanum = subsintagmanum; // Número de subsintagma en el mateix sintagma - una word pot contenir un subsintagma
    this.words = words;
    this.identation = identation;
    this.sintagmaTag = sintagmaTag;

    // Crea subsintagmes 
    Sintagma.subphrasesCount = 1;
    for(let k = 0; k < words.length; k++){
      const word = words[k];
      if(word.subphrase){
        words[k].subphrase = new Sintagma(linenum, partialnum, Sintagma.subphrasesCount, word.subphrase, identation, "subphrase");
        Sintagma.subphrasesCount++;
      }
    }
  }

  first(){
    return this.words[0];
  }

  size(){
    return this.words.length;
  }

  get(pos){
    return this.words[pos];
  }

  start(pos){
    return this.words[pos].pos;
  }

  end(pos){
    return this.words[pos].end ? this.words[pos].end : this.words[pos].pos + this.words[pos].text.length;
  }

  sintagmaStart(){
    return this.start(0);
  }

  sintagmaEnd(){
    return this.end(this.words.length - 1);
  }

  codeSince(pos){
    return this.words.slice(pos + 1)
      .map((w) => w.text)
      .join(" ");
  }

  codeUntil(pos){
    return this.words.slice(0, pos)
      .map((w) => w.text)
      .join(" ");
  }
}

class Memory {
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
  newSintagma(words, identation, lineNumber) {
    let sintagmaTag = "action";
    if (words[0].command === "if") sintagmaTag = "condition";
    else if (words[0].command === "else") sintagmaTag = "not_condition";
    else if (
      words[0].command === "repeat" ||
      words[0].command === "for" ||
      words[0].command === "while"
    )
      sintagmaTag = "bucle";
    else if (words[0].command === "define") sintagmaTag = "function_definition";

    if (this.last() !== undefined && this.last().linenum === lineNumber)
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

    const sintagma = new Sintagma(lineNumber, this._partialcount, 0, words, identation, sintagmaTag)
    this.past.push(sintagma);
    return sintagma;
  }

  /*
   * Retorna l'últim sintagma
   */
  last() {
    if (this.past.length === 0) return undefined;
    return this.past[this.past.length - 1];
  }

  cercaIf(searchScoped = false, onScope = -1) {
    // Cerca l'últim if. Navegant enrere s'ha de trobar un condition abans que 2 o més actions.
    let countActions = 0;
    for (let i = this.past.length - 2; i >= 0; i--) {
      // A tenir en compte que es comprova un cop ja hi ha la línia actual (per xo el -2)
      const sintagma = this.past[i];

      if (searchScoped && sintagma.identation !== onScope) continue;
      if (sintagma.sintagmaTag === "condition") return true;
      if (sintagma.sintagmaTag === "not_condition") return false;
      if (sintagma.sintagmaTag === "action") countActions++;
      if (countActions >= 2) return false;
    }
    return false;
  }

  comprovaScope(identation) {
    // Hi ha d'haver una condition//not_condition o un bucle a l'scope anterior
    // La separació entre scopes es manté

    const identPast = this.last() !== undefined ? this.last().identation : 0;
    const tagPast = this.last() !== undefined ? this.last().sintagmaTag : "action";
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
    this.memory = new Memory();
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
    this._range = level >= 11;
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
    const errors = this._analysePhrase(lineTrim, identationLength, lineNumber);
    return this._processErrors(errors, lineNumber);
  }

  _analysePhrase(lineTrim, identationLength, lineNumber) {
    let errorsFound = [];
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
      errorsFound = errorsFound.concat(res);

      const innerIdentation = identation(action);
      res = this._analysePhrase(
        action.trim(),
        innerIdentation + identationLength + bucledef.length,
        lineNumber
      );
      errorsFound = errorsFound.concat(res);

    } else if (condicional !== null) {
      const condition = condicional[1];
      const action = condicional[5];

      let res = this._analyseSintagma(condition, identationLength, lineNumber);
      errorsFound = errorsFound.concat(res);

      const innerIdentation = identation(action);
      res = this._analysePhrase(
        action.trim(),
        innerIdentation + identationLength + condition.length,
        lineNumber
      );
      errorsFound = errorsFound.concat(res);
    } else if (elseInline !== null) {
      const actionif = elseInline[1];
      const elseword = elseInline[2];
      const actionelse = elseInline[3];

      let res = this._analysePhrase(actionif, identationLength, lineNumber);
      errorsFound = errorsFound.concat(res);

      res = this._analyseSintagma(
        elseword,
        identationLength + actionif.length,
        lineNumber
      );
      errorsFound = errorsFound.concat(res);

      const innerIdentation = identation(actionelse);
      res = this._analysePhrase(
        actionelse.trim(),
        innerIdentation + identationLength + actionif.length + elseword.length,
        lineNumber
      );
      errorsFound = errorsFound.concat(res);
    } else {
      return this._analyseSintagma(lineTrim, identationLength, lineNumber);
    }

    return errorsFound;
  }

  _analyseSintagma(lineTrim, identationLength, lineNumber) {
    const errorsFound = [];

    // Skip empty lines
    if (lineTrim === "") return [];

    // Comprova identació.
    if (this._usesScope && !this.memory.comprovaScope(identationLength)) {
      errorsFound.push(
        new HHError("identation", "hy-identation", 0, identationLength)
      );
    } else if (
      this._usesScope &&
      !this._scopeRecursive &&
      this.memory.isScopeRecursive(identationLength)
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

    const words = this._tagWords(lineTrim, identationLength);
    const sintagma = this.memory.newSintagma(words, identationLength, lineNumber);
    console.log("sintagma: ", sintagma);

    let errors = this._searchMorfoSyntaxisErrors(sintagma);
    if (errors.length > 0) errorsFound.push(...errors);

    errors = this._searchSpecificErrors(sintagma);
    if (errors.length > 0) errorsFound.push(...errors);

    return errorsFound;
  }

  _tagCommands(words) {
    // find print|ask|echo in words
    const positionPAE = words.findIndex(
      (w) => w.text === "print" || w.text === "ask" || w.text === "echo"
    );

    for (let k = 0; k < words.length; k++) {
      for (let i = 0; i < hedyCommands.length; i++) {
        const command = hedyCommands[i];
        let contextValid = true;

        // Després de print, ask o echo tot és string i no comandes (exeptuant at random n3)
        if (
          !this._usesCometesText &&
          positionPAE != -1 &&
          positionPAE < k &&
          !(
            (words[k].text === "at" && words[k + 1].text === "random") || // TODO: Això s'hauria de fer millor
            (words[k].text === "random" && k > 0 && words[k - 1].text === "at")
          )
        )
          continue;

        if (words[k].text !== command.text) {
          if (command.levelStart && command.levelStart > this.level) continue;
          if (command.levelEnd && command.levelEnd < this.level) continue;

          if (words[k].text.toLowerCase() === command.text) {
            words[k].couldBe = {
              command: command.name,
              errorCode: "hy-to-lowercase-command",
            };
          }
          continue;
        }

        if (command.levelStart && command.levelStart > this.level) {
          words[k].couldBe = {
            command: command.name,
            errorCode: "hy-level-unavailable-yet",
          };
          continue;
        } else if (command.levelEnd && command.levelEnd < this.level) {
          words[k].couldBe = {
            command: command.name,
            errorCode: "hy-level-unavailable-deprecated",
          };
          continue;
        }

        if (command.atBegining && k !== 0) {
          words[k].couldBe = {
            command: command.name,
            errorCode: "hy-at-begining",
          };
          continue;
        }

        if (command.hasBefore) {
          const before = words
            .slice(0, k)
            .map((w) => w.text)
            .join(" ");
          contextValid &&= before.match(command.hasBefore);
        }

        if (command.hasAfter) {
          const after = words
            .slice(k + 1)
            .map((w) => w.text)
            .join(" ");
          contextValid &&= after.match(command.hasAfter);
        }

        if (contextValid) {
          words[k].type = "command";
          words[k].tag = "command_" + command.name;
          words[k].command = command.name;
          words[k].couldBe = undefined;
          break;
        } else {
          words[k].couldBe = {
            command: command.name,
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
      const text = words[i].text;
      if (text === "") continue;

      if (words[i].type !== "command") {
        const entity = this.entities.get(text);
        const constant = detectTypeConstant(text);

        if (entity !== undefined) {
          words[i].type = "entity_" + entity.type;
          words[i].tag =
            "entity_" +
            entity.type +
            "_" +
            (entity.subtype ? entity.subtype : "mixed");
          words[i].entity = entity;

        } else if (constant !== undefined) {
          words[i].type = "constant";
          words[i].tag = "constant_" + constant;
          words[i].constant = constant;
        }
      }
    }

    // Processa la frase per trobar operacions
    words = detectMath(words);
    words = detectFuctionUsages(words, this._atrandom, this._functions, this._range);
    words = detectComparations(words);

    return words;
  }

  _searchMorfoSyntaxisErrors(sintagma) {
    const errorsFound = [];

    for (let k = 0; k < sintagma.size(); k++) {
      const word = sintagma.get(k);

      if(word.subphrase){
        errorsFound.push(...this._searchMorfoSyntaxisErrors(word.subphrase));
      }

      let start = sintagma.start(k);
      let end = sintagma.end(k);

      if (word.couldBe && !word.tag.startsWith("entity")) {
        errorsFound.push(
          new HHError(word.text, word.couldBe.errorCode, start, end)
        );
        continue;
      }

      if (word.command) {
        const commandDef = hedyCommands.find((c) => c.name === word.command);
        let argsPostCommand = sintagma.size();
        let argsPreCommand = 0;
        if (!commandDef) continue;

        if (commandDef.elementsAfter !== undefined || commandDef.minElementsAfter !== undefined) {

          const elementsAfter = Array.isArray(commandDef.elementsAfter)
            ? commandDef.elementsAfter
            : [commandDef.elementsAfter];
          let minExpected = k + Math.min(...elementsAfter);
          let maxExpected = k + Math.max(...elementsAfter);

          if(commandDef.minElementsAfter !== undefined) {
            minExpected = k + commandDef.minElementsAfter;
            maxExpected = sintagma.size(); // Trick to avoid for loop unexpected-argument
          }

          argsPostCommand = maxExpected;

          if (sintagma.size() <= minExpected) {
            errorsFound.push(
              new HHErrorVal(
                word.text,
                "hy-command-missing-argument",
                start,
                end,
                minExpected - k
              )
            );
          }

          // Qualsevol element després dels necessaris són erronis
          for (let j = maxExpected + 1; j < sintagma.size(); j++) {
            errorsFound.push(
              new HHErrorVal(
                commandDef.text,
                "hy-command-unexpected-argument",
                sintagma.start(j),
                sintagma.end(j),
                maxExpected - k
              )
            );
          }
        }

        if(commandDef.elementsBefore !== undefined){
          if (k < commandDef.elementsBefore) {
            errorsFound.push(
              new HHErrorVal(
                word.text,
                "hy-command-missing-argument-before",
                start,
                end,
                commandDef.elementsBefore
              )
            );
          }
          else {
            argsPreCommand = k - commandDef.elementsBefore;
          }
        }
          

        if (commandDef.sintaxis) {
          for (let sx = 0; sx < commandDef.sintaxis.length; sx++) {
            const rule = commandDef.sintaxis[sx];
            if (rule.levelStart && rule.levelStart > this.level) continue;
            if (rule.levelEnd && rule.levelEnd < this.level) continue;

            for (
              let j = argsPreCommand;
              j < argsPostCommand + 1 && j < sintagma.size();
              j++
            ) {
              if (j==k) continue; // No comprova la commanda en sí mateixa

              const arg = sintagma.get(j);
              const sstart = sintagma.start(j);
              const send = sintagma.end(j);

              if(commandDef.untilCommand && arg.command) break;
              if (rule.refused && !validType(arg.tag, rule.refused)) continue;
              if (rule.allowed && validType(arg.tag, rule.allowed)) continue;

              errorsFound.push(
                new HHErrorType(
                  word.text,
                  rule.codeerror,
                  sstart,
                  send,
                  arg.tag
                )
              );
            }
          }
        }
      }

      if(word.entity){
        if(word.entity.outOfScope){
          errorsFound.push(
            new HHErrorLine(word.text, "hy-entity-out-of-scope", start, end, word.entity.defLine)
          );
        continue;
        }

        // TODO: Millorar, hauria de ser vàlid si és c = c+1 o c = c ...o un if 
        // No hi ha alerta si depèn d'ella mateixa
        // No hi ha alerta si és dins d0un if
        /*if(word.entity.alreadyDefined && sintagma.linenum === word.entity.defLine && word.pos === word.entity.defChar){
          errorsFound.push(
            new HHErrorLine(word.text, "hy-entity-already-defined", start, end,word.entity.alreadyDefined.defLine)
          );
        }*/
      }

      for (let i = 0; i < hedyGeneralSintaxis.length; i++) {
        const rule = hedyGeneralSintaxis[i];
        if (rule.levelStart && rule.levelStart > this.level) continue;
        if (rule.levelEnd && rule.levelEnd < this.level) continue;
        if (rule.position !== undefined && rule.position !== k) continue;
        if (rule.subphrase!==undefined && rule.subphrase !== sintagma.subsintagmanum) continue;
        if (rule.refused && !validType(word.tag, rule.refused)) continue;
        if (rule.allowed && validType(word.tag, rule.allowed)) continue;
        if(rule.special_orAllowed === "definition" && k+1 < sintagma.size() 
          && sintagma.get(k+1).tag.startsWith("command_variable_define") ) continue;

        if (rule.highlight === "line") {
          start = sintagma.sintagmaStart();
          end = sintagma.sintagmaEnd();
        }

        errorsFound.push(new HHError(word.text, rule.codeerror, start, end));
      }
    }

    return errorsFound;
  }

  _searchSpecificErrors(sintagma) {
    const errorsFound = [];

    for (let i = 0; i < sintagma.size(); i++) {
      const word = sintagma.get(i);

      if(word.subphrase){
        errorsFound.push(...this._searchSpecificErrors(word.subphrase));
      }
 
      let searchWhen = false;
      let taggedCommand = undefined;

      if (word.type && word.type.startsWith("command")) {
        searchWhen = "valid";
        taggedCommand = word.command;
      } else if (word.couldBe) {
        searchWhen = "invalid";
        taggedCommand = word.couldBe.command;
      } else continue;

      for (let j = 0; j < specificHedyErrors.length; j++) {
        const error = specificHedyErrors[j];
        if (error.when !== searchWhen) continue;
        if (error.levelStart && error.levelStart > this.level) continue;
        if (error.levelEnd && error.levelEnd < this.level) continue;
        if (!error.commands.includes(taggedCommand)) continue;

        if (error.hasAfterCommand) {
          const after = sintagma.codeSince(i);
          if (!after.match(error.hasAfterCommand)) continue;
        }
        if (error.hasBeforeCommand) {
          const before = sintagma.codeUntil(i);
          if (!before.match(error.hasBeforeCommand)) continue;
        }
        if (error.list || error.notlist) {
          const place = error.list ? error.list : error.notlist;
          const si = place === "before" ? i - 1 : i + 1;
          if (si < 0 || si >= sintagma.size()) continue;

          const found = sintagma.get(si).tag.startsWith("entity_variable_list");

          if (error.list && !found) continue;
          if (error.notlist && found) continue;
        }

        if (
          error.special_else &&
          this.memory.cercaIf(this._usesScope, sintagma.identation)
        )
          continue;

        if (error.beforeAndAfter && error.beforeAndAfter === "same") {
          if (i === 0 || i+1 >= sintagma.size()) continue;
          if (sintagma.get(i - 1).text !== sintagma.get(i + 1).text) continue;
        } else if (error.beforeAndAfter && error.beforeAndAfter === "same-type") {
          if (i === 0 || i+1 >= sintagma.size()) continue;
          if (compareType(sintagma.get(i - 1).tag,sintagma.get(i + 1).tag)) continue;
        }

        let start = sintagma.start(i);
        let end = sintagma.end(i);

        if (error.highlight === "before_word") {
          if (i === 0) continue;
          start = sintagma.start(i-1);
          end = sintagma.end(i-1);
        } else if (error.highlight === "after_word") {
          if (i+1 >= sintagma.size()) continue;
          start = sintagma.start(i+1);
          end = sintagma.end(i+1);
        } else if (error.highlight === "before") {
          if (i === 0) continue;
          start = sintagma.sintagmaStart();
          end = sintagma.end(i - 1);
        } else if (error.highlight === "after") {
          if (i+1 >= sintagma.size()) continue;
          start = sintagma.start(i + 1);
          end = sintagma.sintagmaEnd();
        }

        errorsFound.push(new HHError(word.text, error.codeerror, start, end));
      }
    }

    return errorsFound;
  }

  _processErrors(errors, lineNumber) {
    // Processa els error i evita que es solapin, si dos errors coincideixen deixa el de més prioritat
    for(let i = 0; i < errors.length; i++){
      const error = errors[i];
      for(let j = i+1; j < errors.length; j++){
        const error2 = errors[j];
        // Si interseccionen
        if(error.start < error2.end && error2.start < error.end){
          // Manté el de més prioritat	
          if(error.priority > error2.priority){
            errors.splice(j,1);
            j--;
            //console.log("error eliminat a la línia " + lineNumber + ":", error2, "ja que intersecciona amb", error);
          }
          else{
            errors.splice(i,1);
            i--;
            //console.log("error eliminat a la línia " + lineNumber + ":", error, "ja que intersecciona amb", error2);
            break;
          }
        }
      }
    }
    return errors;
  }

}

module.exports = {
  CheckHedy,
};

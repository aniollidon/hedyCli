
function entreCometes(text, pos) {
  let contasimple = 0;
  let contaDoble = 0;

  for (let i = 0; i < pos; i++) {
    if (contasimple %2 === 0 && text[i] === '"') 
      contaDoble++;

    if (contaDoble %2 === 0 &&  text[i] === "'")
      contasimple++;
  }

  if (contasimple % 2 === 1 || contaDoble % 2 === 1)
    return true;

  return false;
}

function separarParaules(codi) {
  const regex = /'([^']*)'|"([^"]*)"|(\d+\.\d+|\d+)|([\p{L}_\d.]+)|([^\p{L}\d\s."']+)/gu;
  let paraules = [];
  let match;

  while ((match = regex.exec(codi)) !== null) {
      const [_, cometesSimples, cometesDobles, numero, paraula, simbols] = match;
      const posicio = match.index; // Posició inicial de la coincidència

      if (cometesSimples !== undefined) {
          paraules.push({ text: `'${cometesSimples}'`, pos: posicio }); // Text entre cometes simples
      } else if (cometesDobles !== undefined) {
          paraules.push({ text: `"${cometesDobles}"`, pos: posicio }); // Text entre cometes dobles
      } else if (paraula !== undefined) {
          paraules.push({ text: paraula, pos: posicio }); // Paraules normals amb lletres, dígits o subratllat
      } else if (numero !== undefined) {
          paraules.push({ text: numero, pos: posicio }); // Números enters o decimals
      } else if (simbols !== undefined) {
          paraules.push({ text: simbols, pos: posicio }); // Seqüències de símbols consecutius
      }
  }

  return paraules;
}

function detectTypeConstant(text) {
  const word = text.trim();

  // Si és un número
  if (!isNaN(word)&& !word.startsWith('.')) 
    if (word.includes('.')) return 'number_decimal';
    else return 'number_integer';

  // Pot ser una nota musical
  if (word.match(/^\b(?:C[0-9]|D[0-9]|E[0-9]|F[0-9]|G[0-9]|A[0-9]|B[0-9]|[1-6][0-9]|70|[1-9]|[A-G])\b$/)) return 'note';

  // Pot ser un color
  if(word.match(/\b(blue|green|red|black|brown|gray|orange|pink|purple|white|yellow)\b/)) return 'color';

  // Si comença i acaba per cometes és un string
  if((word.startsWith('"') && word.endsWith('"')) || (word.startsWith("'") && word.endsWith("'"))) return 'string_quoted';
  else if (word === '_') return 'blank';
  else return 'string_unquoted';
}

function getType(tag) {
  if (tag.includes("number") || tag.startsWith("math")) return "number";
  if (tag.includes("string")) return "string";
  if (tag.includes("color")) return "color";
  if (tag.includes("note")) return "note";
  if (tag.startsWith("entity_variable_list")) return "list";
  return "mixed";
}

function compareType(tag1, tag2) {
  const type1 = getType(tag1);
  const type2 = getType(tag2);
  if (type1 === "mixed" || type2 === "mixed") return true;
  return type1 === type2;
}

function validType(tag, list){
  for(let i = 0; i < list.length; i++){
    let valid = false;
    if(list[i] === "$number"){
      valid = tag.includes("number") || tag.startsWith("entity_variable_value") || tag.startsWith("math")
      || tag.startsWith("function_usage") || tag.startsWith("call");
    }
    else if(list[i] === "$string"){
      valid = tag.includes("string") || tag.startsWith("entity_variable_value") || tag.startsWith("function_usage") || tag.startsWith("call");
    }
    else if(list[i] === "$quoted"){
      valid = tag.includes("string_quoted") || tag.startsWith("entity_variable_value") || tag.startsWith("function_usage") || tag.startsWith("call");
    }
    else if(list[i] === "$stored"){
      valid = tag.startsWith("entity_variable_value") || tag.startsWith("function_usage") || tag.startsWith("call");
    }
    else if(tag.startsWith(list[i])) valid = true;

    if(valid) return true;
  }

  return false;
}

function detectFuctionUsages(tokens, hasAtRandom=false, hasCall=false, hasRange = false) {
  let result = [];
  let i = 0;
  
  while (i < tokens.length) {
    // at random calls
    if (hasAtRandom && i  + 2 < tokens.length 
       && !tokens[i].command
       && tokens[i+1].tag === "command_at"
       && tokens[i + 2].tag === "command_random"
    ) {
      const phrase = [tokens[i], tokens[i + 1], tokens[i + 2]];
      result.push({
        text: phrase.map(token => token.text).join(" "),
        tag: "call_at_random",
        pos: tokens[i].pos,
        end: phrase[phrase.length-1].pos + phrase[phrase.length-1].text.length,
        type: "function_usage",
        subphrase: phrase
      });
      i += 3;
    } 
    // range _ to _ calls
    else if (hasRange && i + 3 < tokens.length
      && tokens[i].command === "range"
      && !tokens[i + 1].command
      && tokens[i + 2].command === "to_range"
      && !tokens[i + 3].command){
        const phrase = [tokens[i], tokens[i + 1], tokens[i + 2], tokens[i + 3]];
        result.push({
          text: phrase.map(token => token.text).join(" "),
          tag: "call_range",
          pos: tokens[i].pos,
          end: phrase[phrase.length-1].pos + phrase[phrase.length-1].text.length,
          type: "function_usage",
          subphrase: phrase
        });
        i += 4;
      }
    // Function calls
    else if (hasCall && i +1 < tokens.length  
        && tokens[i].tag === "command_call"
        && tokens[i + 1].type === "entity_function") {
          const pos = tokens[i].pos;

          // Detecta with args
          if(i + 2 < tokens.length && tokens[i + 2].tag === "command_with") {
            let phrase = [tokens[i], tokens[i + 1], tokens[i + 2]];
            i += 3;

            let nextargument = true;
            while (i < tokens.length && nextargument && (tokens[i].tag.startsWith("entity_variable") ||
               tokens[i].tag.startsWith("constant"))) {

                if(i+2 < tokens.length && tokens[i+1].tag === "command_comma_list" ){
                  phrase.push(tokens[i], tokens[i+1]);
                  i += 2;
                  nextargument = true;
                }
                else{
                  phrase.push(tokens[i]);
                  i++;
                  nextargument = false;
                }
            }

            result.push({
              text: phrase.map(token => token.text).join(" "),
              tag: "call_function",
              pos: pos,
              end: phrase[phrase.length-1].pos + phrase[phrase.length-1].text.length,
              type: "function_usage",
              subphrase: phrase
            });
          }
        }
    else {
        result.push(tokens[i]);
        i++;
    }

        
  }
  
  return result;
}

function detectConditions(tokens) {
  let result = [];
  let i = 0;

  // Preprocess to join not_in
  let j = 0;
  while (j < tokens.length) {
    if (tokens[j].command === "not" && j + 1 < tokens.length && tokens[j + 1].command === "in") {
      tokens[j].text = "not in";
      tokens[j].tag = "command_not_in";
      tokens[j].command = "not_in";
      tokens[j].pos = tokens[j].pos;
      tokens[j].end = tokens[j + 1].end;
      tokens[j].type = "command";
      tokens.splice(j + 1, 1);
    } else {
      j++;
    }
  }

  const comparators = new Set(["is", "=", "==", "!=", "in", "not in", "<", ">", "<=", ">="]);

  function allowedType(token) {
    return token.tag.startsWith("entity_variable") || token.tag.startsWith("constant") || token.tag.startsWith("command_pressed") || token.tag.startsWith("call_range");
  }

  while (i < tokens.length) {
      if(i+2 < tokens.length && allowedType(tokens[i]) && tokens[i+1].type === "command" && comparators.has(tokens[i+1].text) && allowedType(tokens[i+2])) {
        const phrase = [tokens[i], tokens[i+1], tokens[i+2]];
        let pos = tokens[i].pos;
        const operator = tokens[i+1].text;

        // Evita comparacions en definicions de variables
        if((operator === "is" || operator === "=") && i+1 === 1){
          result.push(tokens[i]);
          i++;
          continue;
        }

        result.push({
          text: phrase.map(token => token.text).join(" "),
          tag: "condition_"+tokens[i+1].tag,
          pos: pos,
          end: phrase[phrase.length-1].pos + phrase[phrase.length-1].text.length,
          type: "condition",
          subphrase: phrase
        });
        i += 3;
      } else {
          result.push(tokens[i]);
          i++;
      }
  }
  
  return result;
}


function detectMath(tokens) {
  let result = [];
  let i = 0;
  
  const operators = new Set(["+", "-", "*", "/"]);

  function allowedType(token) {
    return !token.command;
  }

  while (i < tokens.length) {
      if (allowedType(tokens[i])) {
          let phrase = [tokens[i]];
          let pos = tokens[i].pos;
          i++;
          
          while (i + 1 < tokens.length && tokens[i].command && operators.has(tokens[i].text) && allowedType(tokens[i + 1])) {
              phrase.push(tokens[i], tokens[i + 1]);
              i += 2;
          }
          
          if (phrase.length > 1) {
              result.push({
                  text: phrase.map(token => token.text).join(" "),
                  tag: "math",
                  pos: pos,
                  end: phrase[phrase.length-1].pos + phrase[phrase.length-1].text.length,
                  type: "operation",
                  subphrase: phrase
              });
          } else {
              result.push(phrase[0]);
          }
      } else {
          result.push(tokens[i]);
          i++;
      }
  }
  
  return result;
}

function varDefinitionType(linetext, hasQuotes, define_var_operator, entities) {
  const isList = enUnaLlista(linetext, linetext.length-1, hasQuotes, define_var_operator);
  if(isList) return 'list';
  const despresIgual = define_var_operator.includes("=") ? linetext.indexOf('=')+1 : -1;
  const despresIs = define_var_operator.includes("is") ? linetext.indexOf(' is ')+4 : -1;
  const pos = despresIgual > despresIs ? despresIgual : despresIs;
  const despres = linetext.substring(pos, linetext.length).trim();

  if(despres.match(/\+|-|\*|\//)) return 'value_mixed';
  if(entities[despres.trim()]) return 'value_mixed';
  if(despres.match(/^ *ask /)) return 'value_mixed';

  return 'value_' + detectTypeConstant(despres);
}

function enUnaLlista(text, pos, hasQuotes, define_var_operator) {
  const abans = text.substring(0, pos);
  const despres = text.substring(pos);

  const conteWith = text.indexOf('with'); 
  const conteCall = text.indexOf('call');
  let abansComa = abans.lastIndexOf(',');
  let abansIgual = define_var_operator.includes("=") ? abans.lastIndexOf('='): -1;
  let abansIs = define_var_operator.includes("is") ? abans.lastIndexOf(' is '): -1;

  let despresComa = despres.indexOf(',');

  if (hasQuotes) {
    if(abansComa !== -1 && entreCometes(abans, abansComa))
      abansComa = -1;

    if(abansIgual !== -1 && entreCometes(abans, abansIgual))
      abansIgual = -1;

    if(abansIs !== -1 && entreCometes(abans, abansIs))
      abansIs = -1;

    if(despresComa !== -1 && entreCometes(despres, despresComa))
      despresComa = -1;

    if(conteWith !== -1 && !entreCometes(text, conteWith)
      && conteCall !== -1 && !entreCometes(text, conteCall)) return false;
  }

  return (abansComa > 0 || despresComa > 0) && (abansIgual > 0 || abansIs > 0);
}

function getLastWord(text){
  const words = text.replace(/\[/, '').trim().split(' ');
  return words[words.length-1];
}

function getFirstWord(text){
  const words = text.trim().split(' ');
  return words[0];
}

function identation(line) {
  const identation = line.match(/^[\t ]+/g);
  const identationLength = identation !== null ? identation[0].length : 0;
  return identationLength;
}

/* Donat un text i una posció desplaça la posició fins que troba un caràcter que no sigui un espai o tabulador */
function trimPosStart(text, start){
  let pos = start;
  while (text[pos] === ' ' || text[pos] === '\t') {
    pos++;
  }
  return pos;
}

/* Donat un text i una posició desplaça la posició fins que troba un caràcter que no sigui un espai o tabulador */
function trimPosEnd(text, end){
  let pos = end;
  while (text[pos-1] === ' ' || text[pos-1] === '\t') {
    pos--;
  }
  return pos;
}

module.exports = {
    entreCometes,
    enUnaLlista,
    identation,
    trimPosStart,
    trimPosEnd,
    getLastWord,
    getFirstWord,
    varDefinitionType,
    separarParaules,
    detectTypeConstant,
    detectMath,
    detectFuctionUsages,
    detectConditions,
    validType,
    compareType
}
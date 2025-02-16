
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
          paraules.push({ name: `'${cometesSimples}'`, pos: posicio }); // Text entre cometes simples
      } else if (cometesDobles !== undefined) {
          paraules.push({ name: `"${cometesDobles}"`, pos: posicio }); // Text entre cometes dobles
      } else if (paraula !== undefined) {
          paraules.push({ name: paraula, pos: posicio }); // Paraules normals amb lletres, dígits o subratllat
      } else if (numero !== undefined) {
          paraules.push({ name: numero, pos: posicio }); // Números enters o decimals
      } else if (simbols !== undefined) {
          paraules.push({ name: simbols, pos: posicio }); // Seqüències de símbols consecutius
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
  if((word.startsWith('"') && word.endsWith('"')) || (word.startsWith("'") && word.endsWith("'"))) return 'string';
  else if (word === '_') return 'blank';
  else return 'string_unquoted';
}

function validType(search, list){
  for(let i = 0; i < list.length; i++){
    if(search.startsWith(list[i])) return true;
  }
  return false;
}

function detectFuctionUsages(tokens, hasAtRandom=false, hasCall=false) {
  let result = [];
  let i = 0;
  
  while (i < tokens.length) {
    // at random calls
    if (hasAtRandom && i  + 2 < tokens.length 
       && tokens[i].type === "entity_variable" && tokens[i].info.subtype === "list"
       && tokens[i+1].type === "command" && tokens[i+1].name === "at" 
       && tokens[i + 2].type === "command" && tokens[i + 2].name === "random"
    ) {
      const phrase = [tokens[i], tokens[i + 1], tokens[i + 2]];
      result.push({
        name: "at_random",
        pos: tokens[i].pos,
        type: "function_usage",
        phrase: phrase
      });
      i += 3;
    } 
    // Function calls
    else if (hasCall && i +1 < tokens.length  
        && tokens[i].type === "command" && tokens[i].name === "call" 
        && tokens[i + 1].type === "entity_function") {
          const pos = tokens[i].pos;

          // Detecta with args
          if(i + 2 < tokens.length && tokens[i + 2].type === "command" && tokens[i + 2].name === "with") {
            let phrase = [tokens[i], tokens[i + 1], tokens[i + 2]];
            i += 3;

            let nextargument = true;
            while (i < tokens.length && nextargument && (tokens[i].type === "entity_variable" ||
               tokens[i].type.startsWith("constant"))) {

                if(i+2 < tokens.length && tokens[i+1].type === "command" && tokens[i+1].name === ","){
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
              name: "function_call",
              pos: pos,
              type: "function_usage",
              phrase: phrase
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

function detectComparations(tokens) {
  let result = [];
  let i = 0;

  // Preprocess to join not_in
  let j = 0;
  while (j < tokens.length) {
    if (tokens[j].type === "command" && tokens[j].name === "not" && j + 1 < tokens.length && tokens[j + 1].type === "command" && tokens[j + 1].name === "in") {
      tokens[j].name = "not_in";
      tokens[j].pos = tokens[j].pos;
      tokens[j].type = "command";
      tokens.splice(j + 1, 1);
    } else {
      j++;
    }
  }

  const comparators = new Set(["is", "=", "==", "!=", "in", "not_in", "<", ">", "<=", ">="]);

  function allowedType(token) {
    return token.type === "entity_variable" || token.type.startsWith("constant");
  }

  while (i < tokens.length) {
      if(i+2 < tokens.length && allowedType(tokens[i]) && tokens[i+1].type === "command" && comparators.has(tokens[i+1].name) && allowedType(tokens[i+2])) {
        const phrase = [tokens[i], tokens[i+1], tokens[i+2]];
        let pos = tokens[i].pos;
        const operator = tokens[i+1].name;

        // Evita comparacions en definicions de variables
        if((operator === "is" || operator === "=") && i+1 === 1){
          result.push(tokens[i]);
          i++;
          continue;
        }

        result.push({
          name: "comp_"+operator,
          pos: pos,
          type: "comparation",
          phrase: phrase
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
    return token.type === "entity_variable" || token.type.startsWith("constant_number");
  }

  while (i < tokens.length) {
      if (allowedType(tokens[i])) {
          let phrase = [tokens[i]];
          let pos = tokens[i].pos;
          i++;
          
          while (i + 1 < tokens.length && tokens[i].type === "command" && operators.has(tokens[i].name) && allowedType(tokens[i + 1])) {
              phrase.push(tokens[i], tokens[i + 1]);
              i += 2;
          }
          
          if (phrase.length > 1) {
              result.push({
                  name: "math",
                  pos: pos,
                  type: "operation",
                  phrase: phrase
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

function varDefinitionType(linetext, hasQuotes, define_var_operator) {
  const isList = enUnaLlista(linetext, linetext.length-1, hasQuotes, define_var_operator);
  if(isList) return 'list';
  const despresIgual = define_var_operator.includes("=") ? linetext.indexOf('=')+1 : -1;
  const despresIs = define_var_operator.includes("is") ? linetext.indexOf(' is ')+4 : -1;
  const pos = despresIgual > despresIs ? despresIgual : despresIs;
  const despres = linetext.substring(pos, linetext.length).trim();

  return detectTypeConstant(despres);
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
    detectComparations,
    validType
}

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
  const regex = /'([^']*)'|"([^"]*)"|([\p{L}_\d]+)|([^\p{L}\d\s"']+)/gu;
  let paraules = [];
  let match;

  while ((match = regex.exec(codi)) !== null) {
      const [_, cometesSimples, cometesDobles, paraula, simbols] = match;
      const posicio = match.index; // Posició inicial de la coincidència

      if (cometesSimples !== undefined) {
          paraules.push({ name: `'${cometesSimples}'`, pos: posicio }); // Text entre cometes simples
      } else if (cometesDobles !== undefined) {
          paraules.push({ name: `"${cometesDobles}"`, pos: posicio }); // Text entre cometes dobles
      } else if (paraula !== undefined) {
          paraules.push({ name: paraula, pos: posicio }); // Paraules normals amb lletres, dígits o subratllat
      } else if (simbols !== undefined) {
          paraules.push({ name: simbols, pos: posicio }); // Seqüències de símbols consecutius
      }
  }

  return paraules;
}

function detectTypeConstant(text, hasQuotes=true, hasNotes=false, hasColors=false) {
  const word = text.trim();

  // Si és un número
  if (!isNaN(word)) return 'number';

  // Pot ser una nota musical
  if (hasNotes && word.match(/\b(?:C[0-9]|D[0-9]|E[0-9]|F[0-9]|G[0-9]|A[0-9]|B[0-9]|[1-6][0-9]|70|[1-9]|[A-G])\b/)) return 'note';

  // Pot ser un color
  if(hasColors && word.match(/\b(blue|green|red|black|brown|gray|orange|pink|purple|white|yellow)\b/)) return 'color';

  // Si comença i acaba per cometes és un string
  if(hasQuotes && (word.startsWith('"') && word.endsWith('"')) || (word.startsWith("'") && word.endsWith("'"))) return 'string';
  else if (!hasQuotes) return 'string';

  else return undefined;
}


function varDefinitionType(linetext, hasQuotes, define_var_operator) {
  const isList = enUnaLlista(linetext, linetext.length-1, hasQuotes, define_var_operator);
  if(isList) return 'list';
  const despresIgual = define_var_operator.includes("=") ? linetext.indexOf('=')+1 : -1;
  const despresIs = define_var_operator.includes("is") ? linetext.indexOf(' is ')+4 : -1;
  const pos = despresIgual > despresIs ? despresIgual : despresIs;
  const despres = linetext.substring(pos, linetext.length).trim();

  if (!isNaN(despres)) return 'number';
  else return 'string';
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
    detectTypeConstant
}
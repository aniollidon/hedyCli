
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

function enUnaLlista(text, pos, hasQuotes, define_var_operator) {
  // NOMLLISTA = a, CERCA, c <-llista
  // NOMLLISTA = CERCA <- no llista
  // NOMLLISTA = a, b, c # CERCA <- no llista
  // CERCA ... NOMLLISTA = a, b, c <- no llista
  // ... "a, b," CERCA <- no llista
  // ... CERCA ... "a, b," <- no llista


  const abans = text.substring(0, pos);
  const despres = text.substring(pos);

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
  }

  return (abansComa > 0 || despresComa > 0) && (abansIgual > 0 || abansIs > 0);
}

function identation(line) {
  const identation = line.match(/^[\t ]+/g);
  const identationLength = identation !== null ? identation[0].length : 0;
  return identationLength;
}

module.exports = {
    entreCometes,
    enUnaLlista,
    identation
}
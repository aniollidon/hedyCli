function entreCometes(text, pos) {
  let contasimple = 0
  let contaDoble = 0

  for (let i = 0; i < pos; i++) {
    if (contasimple % 2 === 0 && text[i] === '"') contaDoble++

    if (contaDoble % 2 === 0 && text[i] === "'") contasimple++
  }

  if (contasimple % 2 === 1 || contaDoble % 2 === 1) return true

  return false
}

function separarParaules(codi) {
  const regex = /'([^']*)'|"([^"]*)"|([\p{L}_\d.]+)|(\d+\.\d+|\d+)|([^\p{L}\d\s.]+)/gu
  let paraules = []
  let match

  while ((match = regex.exec(codi)) !== null) {
    const [_, cometesSimples, cometesDobles, paraula, numero, simbols] = match
    let posicio = match.index // Posició inicial de la coincidència

    if (cometesSimples !== undefined) {
      paraules.push({ text: `'${cometesSimples}'`, pos: posicio }) // Text entre cometes simples
    } else if (cometesDobles !== undefined) {
      paraules.push({ text: `"${cometesDobles}"`, pos: posicio }) // Text entre cometes dobles
    } else if (paraula !== undefined) {
      paraules.push({ text: paraula, pos: posicio }) // Paraules normals amb lletres, dígits o subratllat
    } else if (numero !== undefined) {
      paraules.push({ text: numero, pos: posicio }) // Números enters o decimals
    } else if (simbols !== undefined) {
      // Si els símbols inclouen [ ] : + - * / ( ), separa'ls individualment
      const simbolsSeparats = simbols.split(/([\[\]:+\-*/()])/).filter(Boolean)
      simbolsSeparats.forEach(simbol => {
        paraules.push({ text: simbol, pos: posicio })
        posicio += simbol.length
      })
    }
  }

  return paraules
}

function identation(line) {
  const identation = line.match(/^[\t ]+/g)
  const identationLength = identation !== null ? identation[0].length : 0
  return identationLength
}

/* Donat un text i una posció desplaça la posició fins que troba un caràcter que no sigui un espai o tabulador */
function trimPosStart(text, start) {
  let pos = start
  while (text[pos] === ' ' || text[pos] === '\t') {
    pos++
  }
  return pos
}

/* Donat un text i una posició desplaça la posició fins que troba un caràcter que no sigui un espai o tabulador */
function trimPosEnd(text, end) {
  let pos = end
  while (text[pos - 1] === ' ' || text[pos - 1] === '\t') {
    pos--
  }
  return pos
}

module.exports = {
  entreCometes,
  separarParaules,
  identation,
  trimPosStart,
  trimPosEnd,
}

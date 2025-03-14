class Sintagma {
  constructor(linenum, partialnum, subsintagmanum, words, identation, sintagmaTag) {
    this.linenum = linenum // Línia on es troba el sintagma
    this.partialnum = partialnum // Número de sintagma en la mateixa línia
    this.subsintagmanum = subsintagmanum // Número de subsintagma en el mateix sintagma - una word pot contenir un subsintagma
    this.words = words
    this.identation = identation
    this.sintagmaTag = sintagmaTag

    // Crea subsintagmes
    Sintagma.subphrasesCount = 1
    for (let k = 0; k < words.length; k++) {
      const word = words[k]
      if (word.subphrase) {
        words[k].subphrase = new Sintagma(
          linenum,
          partialnum,
          Sintagma.subphrasesCount,
          word.subphrase,
          identation,
          'subphrase',
        )
        Sintagma.subphrasesCount++
      }
    }
  }

  first() {
    return this.words[0]
  }

  last() {
    return this.words[this.words.length - 1]
  }

  size() {
    return this.words.length
  }

  get(pos) {
    return this.words[pos]
  }

  markUsed(pos) {
    this.words[pos].used = true

    if (this.words[pos].subphrase)
      for (let k = 0; k < this.words[pos].subphrase.words.length; k++) {
        this.words[pos].subphrase.markUsed(k)
      }
  }

  start(pos) {
    return this.words[pos].pos
  }

  position_last(word) {
    return this.words.map(w => w.text).lastIndexOf(word)
  }

  end(pos) {
    return this.words[pos].end ? this.words[pos].end : this.words[pos].pos + this.words[pos].text.length
  }

  sintagmaStart() {
    return this.start(0)
  }

  sintagmaEnd() {
    return this.end(this.words.length - 1)
  }

  codeSince(pos) {
    return this.words
      .slice(pos + 1)
      .map(w => w.text)
      .join(' ')
  }

  codeUntil(pos) {
    return this.words
      .slice(0, pos)
      .map(w => w.text)
      .join(' ')
  }
}

module.exports = { Sintagma }

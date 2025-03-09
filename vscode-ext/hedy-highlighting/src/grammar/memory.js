const { Sintagma } = require('./sintagma')

class Memory {
  constructor() {
    this.past = []
    this._partialcount = 0
    this._definedScopeIdentation = -1 //Nombre de caràcters definits per a identar
    this._scopes = [0]
  }

  /*
   * Es crida un cop per cada sintagma (part de la frase) que es vol analitzar
   * només en els inline es diferencia de les línies senceres
   */
  newSintagma(words, identation, lineNumber) {
    let sintagmaTag = 'action'
    if (words[0].command === 'if' || words[0].command === 'elif') sintagmaTag = 'condition'
    else if (words[0].command === 'else') sintagmaTag = 'not_condition'
    else if (words[0].command === 'repeat' || words[0].command === 'for' || words[0].command === 'while')
      sintagmaTag = 'bucle'
    else if (words[0].command === 'define') sintagmaTag = 'function_definition'

    if (this.last() !== undefined && this.last().linenum === lineNumber) this._partialcount++
    else this._partialcount = 0

    if (identation > 0 && this._definedScopeIdentation === -1) this._definedScopeIdentation = identation // Defineix la identació dels scopes

    if (identation > this._scopes[this._scopes.length - 1]) {
      this._scopes.push(identation)
    } else if (identation < this._scopes[this._scopes.length - 1]) {
      // Borra tots els scopes que ja no són vàlids
      while (identation < this._scopes[this._scopes.length - 1]) {
        this._scopes.pop()
      }
    }

    const sintagma = new Sintagma(lineNumber, this._partialcount, 0, words, identation, sintagmaTag)
    this.past.push(sintagma)
    return sintagma
  }

  /*
   * Retorna l'últim sintagma
   */
  last() {
    if (this.past.length === 0) return undefined
    return this.past[this.past.length - 1]
  }

  cercaIf(searchScoped = false, onScope = -1) {
    // Cerca l'últim if. Navegant enrere s'ha de trobar un condition abans que 2 o més actions.
    let countActions = 0
    for (let i = this.past.length - 2; i >= 0; i--) {
      // A tenir en compte que es comprova un cop ja hi ha la línia actual (per xo el -2)
      const sintagma = this.past[i]

      if (searchScoped && sintagma.identation !== onScope) continue
      if (sintagma.sintagmaTag === 'condition') return true
      if (sintagma.sintagmaTag === 'not_condition') return false
      if (sintagma.sintagmaTag === 'action') countActions++
      if (countActions >= 2) return false
    }
    return false
  }

  comprovaScope(identation) {
    // Hi ha d'haver una condition//not_condition o un bucle a l'scope anterior
    // La separació entre scopes es manté

    const identPast = this.last() !== undefined ? this.last().identation : 0
    const tagPast = this.last() !== undefined ? this.last().sintagmaTag : 'action'
    const pastIdentable =
      tagPast === 'condition' || tagPast === 'not_condition' || tagPast === 'bucle' || tagPast === 'function_definition'

    // L'identació ha de ser múltiple de la definida
    if (identation > 0 && this._definedScopeIdentation !== -1 && identation % this._definedScopeIdentation !== 0)
      return false

    if (identation === identPast) {
      if (pastIdentable) return false
      return true
    } else if (identation > identPast) {
      if (pastIdentable) return true
      return false
    } else {
      // identation < identPast
      if (this._scopes.includes(identation)) return true
      return false
    }
  }

  isScopeRecursive(identation) {
    const identPast = this.last() !== undefined ? this.last().identation : 0

    // Augmentem l'scope però aquest ja té un scope anterior
    if (identation > identPast && this._scopes.length > 1) return true
    return false
  }
}

module.exports = { Memory }

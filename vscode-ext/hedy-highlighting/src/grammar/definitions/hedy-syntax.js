const commands = require('./commands')
const specificHedyErrors = require('./specific-errors')
const hedyGeneralSyntax = require('./general-syntax')
const errorMapping = require('./error-mapping')

class Command {
  constructor(obj) {
    Object.assign(this, obj)
    this.isSymbol = this.text.match('^[a-z]') === null
    this.rtext = this.text.replace(/[+*]/g, '\\$&')
    if (!this.isSymbol) this.rtext = `\\b${this.rtext}\\b`

    if (!this.commonErrors) this.commonErrors = []

    if (!this.arguments) this.arguments = []

    if (!this.name) this.name = this.text
  }
}

convertListToComandClass = comands => {
  return comands.map(comand => new Command(comand))
}

module.exports = {
  hedyCommands: convertListToComandClass(commands),
  specificHedyErrors,
  hedyGeneralSyntax,
  errorMapping,
}

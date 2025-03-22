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

    if (!this.arguments) this.arguments = []

    if (!this.name) this.name = this.text
  }
}

class hedyCommands {
  constructor(level) {
    this.level = level
    this.commands = {}

    for (const comm of commands) {
      const obj = new Command(comm)

      if (obj.syntax) {
        for (const syntax of obj.syntax) {
          if (syntax.levelStart && level < syntax.levelStart) continue
          if (syntax.levelEnd && level > syntax.levelEnd) continue

          // Afegeix a la comanda qualsevol element de sintaxi (exeptuant levelStart i levelEnd)
          for (const key in syntax) {
            if (key !== 'levelStart' && key !== 'levelEnd') {
              obj[key] = syntax[key]
            }
          }
        }
      }
      this.commands[obj.name] = obj
    }
  }

  getByName(name) {
    return this.commands[name]
  }

  getAll() {
    return Object.values(this.commands)
  }
}

module.exports = {
  hedyCommands,
  specificHedyErrors,
  hedyGeneralSyntax,
  errorMapping,
}

class LangHandler {
  constructor(def = 'ca') {
    this.setLang(def)
  }

  setLang(lang) {
    if (lang === 'en') {
      const english = require('./english.js')
      this.command2text = english.command2text
      this.type2text = english.type2text
      this.error2text = english.error2text
      this.getText = english.getText
    } else {
      // default to catalan
      const catalan = require('./catala.js')
      this.command2text = catalan.command2text
      this.type2text = catalan.type2text
      this.error2text = catalan.error2text
      this.getText = catalan.getText
    }
  }
}

const langHandler = new LangHandler()
module.exports = langHandler

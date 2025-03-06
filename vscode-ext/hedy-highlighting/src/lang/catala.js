const commands = {
  compare_is: 'is (comparació)',
  variable_define_is: 'is (definició de variable)',
  comma_list: 'comma (llista)',
  to_list: 'to (llista)',
  to_range: 'to (després de range)',
  compare_equal: 'igual (comparació)',
  variable_define_equal: 'igual (definició de variable)',
  sum: 'suma (+)',
  rest: 'resta (-)',
  multiplication: 'multiplicació (*)',
  division: 'divisió (/)',
  argument_separator: "coma (separador d'arguments)",
  greater_than: 'major (>)',
  less_than: 'menor (<)',
  greater_than_or_equal: 'major o igual (>=)',
  less_than_or_equal: 'menor o igual (<=)',
  compare_equalequal: 'igual (==)',
  not_equal: 'diferent (!=)',
}

const errors = {
  'hy-context': {
    message: "La comanda '[NAME]' no es pot fer servir d'aquesta manera.",
  },
  'hy-recomended-equal': {
    message: "És més recomanable fer servir '=' enlloc de 'is'.",
  },
  'hy-lines-must-start-with': {
    message: 'Les línies han de començar amb una comanda o una definició.',
  },
  'hy-text-must-be-quoted': {
    message: "Aquest text hauria d'anar entre cometes.",
  },
  'hy-recomended-equalequal': {
    message: "En aquest nivell ja es pot fer servir '==' enlloc de '[NAME]'.",
  },
  'hy-entity-changes-content-type': {
    message: "Vigila que la variable '[NAME]' ha canviat el tipus a respecte la seva definició a la línia [LINE].",
  },
  'hy-at-begining': {
    message: "La comanda '[NAME]' ha d'anar al començament.",
  },
  'hy-command-missing-argument': {
    message: "La comanda '[NAME]' necessita almenys un argument després.",
    messagePlural: "La comanda '[NAME]' necessita [VALUE] arguments després.",
    messageZero: "La comanda '[NAME]' no necessita arguments.",
  },
  'hy-command-missing-argument-before': {
    message: "La comanda '[NAME]' necessita un argument abans.",
    messagePlural: "La comanda '[NAME]' necessita [VALUE] arguments abans.",
    messageZero: "La comanda '[NAME]' no necessita arguments abans.",
  },
  'hy-command-unexpected-argument': {
    message: "La comanda '[NAME]' només accepta un argument després.",
    messagePlural: "La comanda '[NAME]' només accepta [VALUE] arguments després.",
    messageZero: "La comanda '[NAME]' no accepta cap valor després.",
  },
  'hy-command-unexpected-argument-conditional': {
    message: "La comanda '[NAME]' només accepta una condició després.",
  },
  'hy-execting-function-definition': {
    message:
      "S'espera una definició de funció. El format correcte és 'define <nom>' o a partir de nivell 13 'define <nom> with <arg1>, <arg2> <...>'.",
  },
  'hy-command-missing-argument-comma': {
    message: "Després d'una coma hi ha d'haver un element.",
  },
  'hy-level-unavailable-yet': {
    message: "La comanda '[NAME]' encara no es pot fer servir en aquest nivell.",
  },
  'hy-level-unavailable-deprecated': {
    message: "La comanda '[NAME]' ja no es pot fer servir en aquest nivell.",
  },
  'hy-to-lowercase-command': {
    message: "Potser volies utilitzar la comanda '[LOWER]'?, si és així ha d'estar tota en minúscules.",
  },
  'hy-entity-out-of-scope': {
    message:
      "La variable '[NAME]' s'està usant fora del seu bloc d'identació. La variable s'ha definit a la línia [LINE] que és fora del bloc actual.",
  },
  'hy-always-false': {
    message: 'La condició sempre és falsa i mai es compleix.',
  },
  'hy-always-true': {
    message: 'La condició sempre és certa i sempre es compleix.',
  },
  'hy-same-comparison-true': {
    message: 'No té massa sentit comparar dos cops el mateix. Sempre serà cert.',
  },
  'hy-same-comparison-false': {
    message: 'No té massa sentit comparar dos cops el mateix. Sempre serà fals.',
  },
  'hy-execting-same-type': {
    message: "La comanda '[NAME]' espera el mateix tipus abans i després.",
  },
  'hy-execting-number': {
    message: "La comanda '[NAME]' espera un número. [TYPE-FOUND].",
  },
  'hy-execting-number-integer': {
    message: "La comanda '[NAME]' espera un número enter. [TYPE-FOUND].",
  },
  'hy-execting-command-times': {
    message:
      "La comanda '[NAME]' espera un número enter i després la comanda 'times'. [TYPE-FOUND] a la segona posició.",
  },
  'hy-execting-number-string': {
    message: "La comanda '[NAME]' espera un número o text. [TYPE-FOUND].",
  },
  'hy-execting-number-note': {
    message: "La comanda '[NAME]' espera una nota o un número. [TYPE-FOUND].",
  },
  'hy-execting-color': {
    message: "La comanda '[NAME]' espera un color. [TYPE-FOUND].",
  },
  'hy-execting-condition': {
    message: "La comanda '[NAME]' espera una condició després.",
  },
  'hy-use-elseif-instead': {
    message: "Si després d'un 'else' vols fer 'if', utilitza la comanda 'elif'.",
  },
  'hy-after-needs-list': {
    message: "Després de '[NAME]' cal una llista.",
  },
  'hy-before-needs-list': {
    message: "Abans de '[NAME]' cal una llista.",
  },
  'hy-after-needs-nolist': {
    message: "Després de '[NAME]' no pot haver-hi una llista.",
  },
  'hy-before-needs-nolist': {
    message: "Abans de '[NAME]' no pot haver-hi una llista.",
  },
  'hy-cant-print-list': {
    message: 'Les llistes no es poden imprimir directament.',
  },
  'hy-cant-print-function': {
    message: 'Les funcions no es poden imprimir directament. Fes servir la comanda "call".',
  },
  'hy-add-remove-notlist': {
    message:
      "El format correcte és 'add <item> to <llista>' o 'remove <item> from <llista>'. No pot haver-hi una llista al lloc de l'item.",
  },
  'hy-pressed-must-be-second': {
    message: "La comanda '[NAME]' ha d'anar en segona posició, després de 'is'.",
  },
  'hy-turn-left-right': {
    message: "La comanda '[NAME]' només accepta 'left' o 'right' en aquest nivell.",
  },
  'hy-variabledef-multiplewords': {
    message: 'Per definir una variable només pots fer servir una paraula.',
  },
  'hy-not-decimals': {
    message: 'En aquest nivell els decimals encara no estan permesos.',
  },
  'hy-else-elif-needs-if': {
    message: "La comanda '[NAME]' espera que s'hagi usat 'if' anteriorment.",
  },
  'hy-blanks-not-allowed': {
    message: "Els espais en blanc s'han d'omplir amb codi!",
  },
  'hy-identation': {
    message:
      "La identació no és correcta. Després d'un bucle o condició cal indentar. només en aquests casos.\n" +
      "Recorda que has de ser consistent amb la indentació, cal mantenir sempre la mateixa quantitat d'espais per nivell.",
  },
  'hy-identation-multiple-unavailable': {
    message:
      'En aquest nivell encara no es pot definir un bucle/condició dins un altre bucle/condició. Només es permeten bucles/condicions independents.',
  },
  'hy-unnecessary-quotes': {
    message: 'En aquest nivell encara no cal cometes per aquest text.',
  },
  'hy-entitydef-starts-with-number': {
    message: 'Els noms de variables no poden començar per un número.',
  },
  'hy-function-argument-duplicated': {
    message: 'Al definir una funció no es poden repetir arguments ni utilitzar el nom de la mateixa funció.',
  },
  'hy-call-function-arguments': {
    message: "La funció '[NAME]' espera [VALUE] arguments.",
  },
  'hy-ask-not-in-definition': {
    message: "La comanda 'ask' ha d'anar dins d'una definició de variable.",
  },
  'hy-pressed-needs-is': {
    message: "La comanda '[NAME]' no funciona amb '=', només funciona amb un 'is' davant.",
  },
}

function command2text(command) {
  if (commands[command]) return commands[command]
  return command
}

function type2text(type) {
  if (type.startsWith('constant_number')) {
    if (type === 'constant_number_decimal') tipus = 'un número decimal'
    else tipus = 'un número enter'
  } else if (type.startsWith('constant_string_unquoted')) {
    tipus = 'un text sense cometes'
  } else if (type.startsWith('constant_string_quoted')) {
    tipus = 'un text'
  } else if (type.startsWith('constant_color')) {
    tipus = 'un color'
  } else if (type.startsWith('constant_note')) {
    tipus = 'una nota'
  } else if (type.startsWith('entity_variable_list')) {
    tipus = 'una llista'
  } else if (type.startsWith('entity_function')) {
    tipus = 'un nom de funció'
  } else if (type.startsWith('entity_parameter')) {
    tipus = 'un paràmetre'
  } else if (type.startsWith('entity_variable_value')) {
    tipus = 'una variable'
  } else if (type.startsWith('command')) {
    tipus = 'la comanda ' + command2text(type.replace('command_', ''))
  } else tipus = 'un ' + type

  return tipus
}

function error2text(errorcode) {
  let res = errors[errorcode]
  if (!res) res = { message: errorcode }

  if (!res.message) res.message = errorcode
  if (!res.messagePlural) res.messagePlural = res.message
  if (!res.messageZero) res.messageZero = res.message
  return res
}
module.exports = { command2text, type2text, error2text }

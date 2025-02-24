class Command {
  constructor(obj) {
    Object.assign(this, obj);
    this.isSymbol = this.text.match("^[a-z]") === null;
    this.rtext = this.text.replace(/[+*]/g, "\\$&");
    if (!this.isSymbol) this.rtext = `\\b${this.rtext}\\b`;

    if (!this.commonErrors) this.commonErrors = [];

    if (!this.syntax) this.syntax = [];

    if (!this.name) this.name = this.text;
  }
}

convertListToComandClass = (comands) => {
  return comands.map((comand) => new Command(comand));
};

const operationTemplate = {
  levelStart: 6,
  minElementsAfter: 1,
  untilCommand: true,
  elementsBefore: 1,
  syntax: [
    {
      allowed: ["$number"],
      codeerror: "hy-execting-number",
    },
  ],
};

const hedyCommands = convertListToComandClass([
  {
    text: "print",
    description: "Mostra un text per pantalla",
    atBegining: true,
    minElementsAfter: 1,
    syntax: [
      {
        refused: ["entity_variable_list"],
        codeerror: "hy-cant-print-list",
      },
      {
        levelStart: 4,
        allowed: ["$number", "$quoted"],
        codeerror: "hy-text-must-be-quoted",
      },
    ],
  },
  {
    text: "turn",
    description: "Gira la tortuga",
    atBegining: true,
    elementsAfter: 1,
    syntax: [
      {
        levelStart: 2,
        allowed: ["$number"],
        codeerror: "hy-execting-number",
      },
    ],
  },
  {
    text: "forward",
    description: "Avança la tortuga",
    atBegining: true,
    elementsAfter: 1,
    syntax: [
      {
        allowed: ["$number"],
        codeerror: "hy-execting-number",
      },
    ],
  },
  {
    text: "play",
    description: "Reprodueix una nota",
    atBegining: true,
    elementsAfter: 1,
    syntax: [
      {
        allowed: ["$number", "constant_note"],
        codeerror: "hy-execting-number-note",
      },
    ],
  },
  {
    text: "color",
    description: "Reprodueix una nota",
    atBegining: true,
    elementsAfter: 1,
    syntax: [
      {
        allowed: ["$stored", "constant_color"],
        codeerror: "hy-execting-color",
      },
    ],
  },
  {
    text: "sleep",
    levelStart: 2,
    description: "Espera un temps",
    atBegining: true,
    elementsAfter: [1, 0],
    syntax: [
      {
        allowed: ["$number"],
        codeerror: "hy-execting-number",
      },
    ],
  },
  {
    text: "clear",
    levelStart: 4,
    description: "Neteja la pantalla",
    atBegining: true,
    elementsAfter: 0,
  },
  {
    text: "ask",
    levelEnd: 1,
    description:
      "Pregunta a l'usuari i guarda el valor per retornar-lo el pròxim 'echo'",
    atBegining: true,
    minElementsAfter: 1,
  },
  {
    text: "ask",
    description: "Pregunta a l'usuari i retorna el valor introduït",
    hasBefore: /^[\p{L}_\d]+ (is|=)$/gu,
    levelStart: 2,
    levelEnd: 18,
    minElementsAfter: 1,
    syntax: [
      {
        refused: ["entity_variable_list"],
        codeerror: "hy-cant-print-list",
      },
      {
        levelStart: 4,
        allowed: ["$number", "$quoted"],
        codeerror: "hy-text-must-be-quoted",
      },
    ],
  },
  {
    text: "echo",
    description: "Retorna el resultat d'ask per pantalla",
    atBegining: true,
    levelEnd: 1,
    minElementsAfter: 1,
  },
  {
    text: "right",
    description: "Mou la tortuga a la dreta",
    hasBefore: /^turn$/g,
    levelEnd: 1,
  },
  {
    text: "left",
    description: "Mou la tortuga a la dreta",
    hasBefore: /^turn$/g,
    levelEnd: 1,
  },
  {
    text: "is",
    description: "Compara dos valors i/o variables",
    name: "compare_is",
    levelStart: 2,
    hasBefore: /^(if|elif|while) .*/gu,
  },
  {
    // No hauria d'importar l'ordre, però sino no funciona l'error hy-variabledef-multiplewords
    text: "is",
    description: "Defineix una variable",
    name: "variable_define_is",
    levelStart: 2,
    hasBefore: /^[\p{L}_\d]+$/gu,
    syntax: [
      {
        levelEnd: 11,
        refused: ["constant_string_quoted"],
        codeerror: "hy-unnecessary-quotes",
      },
    ],
  },
  {
    text: ",",
    name: "comma_list",
    description: "Separa els elements d'una llista",
    levelStart: 3,
    hasBefore: /is |=/g,
    minElementsAfter: 1,
  },
  {
    text: "remove",
    description: "Elimina un element de una llista, va acompanyat amb 'from'",
    levelStart: 3,
    elementsAfter: 3,
    atBegining: true,
  },
  {
    text: "from",
    description:
      "Indica de quina llista s'ha d'eliminar un element, va després de 'remove'",
    levelStart: 3,
    hasBefore: /^remove [\p{L}_\d]+$/gu,
    elementsAfter: 1,
  },
  {
    text: "add",
    description: "Afegeix un element a una llista, va acompanyat amb 'to'",
    levelStart: 3,
    elementsAfter: 3,
    atBegining: true,
  },
  {
    text: "to",
    name: "to_list",
    description:
      "Indica a quina llista s'ha d'afegir un element, va després de 'add'",
    levelStart: 3,
    hasBefore: /^add [\p{L}_\d]+$/gu,
    elementsAfter: 1,
  },
  {
    text: "to",
    name: "to_range",
    description:
      "Indica fins a quin numero es defineix l'interval, va després de 'range'",
    levelStart: 11,
    elementsAfter: 1,
    elementsBefore: 1,
    syntax: [
      {
        allowed: ["$number_integer"],
        codeerror: "hy-execting-number-integer",
      },
    ],
    hasBefore: /\brange/g,
  },
  {
    text: "at",
    description:
      "indica quin element aleteatori de la llista s'ha de seleccionar. presendeix sempre a 'random'",
    levelStart: 3,
    levelEnd: 15,
    hasBefore: /[\p{L}_\d]+$/gu,
    hasAfter: /^ *\brandom\b/gu,
    elementsAfter: 1,
  },
  {
    text: "random",
    description:
      "Indica que s'ha de seleccionar un element aleatori de la llista. Cal posar 'at' abans",
    levelStart: 3,
    levelEnd: 15,
    elementsAfter: 0,
    hasBefore: /at\b/gu,
  },
  {
    text: "random",
    description:
      "Indica que s'ha de seleccionar un element aleatori de la llista. Va rodejat de claus: '[random]'",
    levelStart: 16,
    hasBefore: /\[ */gu,
    hasAfter: / *\]/gu,
    elementsAfter: 1,
  },
  {
    text: "if",
    description: "Comença una condició",
    levelStart: 5,
    atBegining: true,
    elementsAfter: 1,
    syntax: [
      {
        allowed: ["condition"],
        codeerror: "hy-execting-condition",
      },
      {
        refused: ["entity_variable_list"],
        codeerror: "hy-cant-print-list",
      },
    ],
  },
  {
    text: "else",
    description: "Indica la branca alternativa d'una condició",
    levelStart: 5,
    atBegining: true,
    elementsAfter: 0,
  },
  {
    text: "pressed",
    description: "Comprova si una tecla està premuda",
    levelStart: 5,
    elementsAfter: 0,
    hasBefore: /^if .*is/g,
  },
  {
    text: "not",
    description: "Indica que un element no està a la llista",
    levelStart: 5,
    hasBefore: /^if .*/g,
    hasAfter: /\bin\b/g,
  },
  {
    text: "in",
    description: "Indica que un element està a la llista",
    levelStart: 5,
    hasBefore: /^(if|elif|for) .*/g,
    elementsAfter: 1,
  },
  {
    text: "=",
    description: "Compara dos valors i/o variables",
    name: "compare_equal",
    levelStart: 6,
    elementsAfter: 1,
    hasBefore: /^(if|elif|while) .*/gu,
  },
  {
    // No hauria d'importar l'ordre, però sino no funciona l'error hy-variabledef-multiplewords
    text: "=",
    name: "variable_define_equal",
    description: "Defineix una variable",
    levelStart: 6,
    hasBefore: /^[\p{L}_\d]+$/gu,
  },
  {
    text: "+",
    name: "sum",
    description: "Suma dos valors",
    levelStart: 6,
    minElementsAfter: 1,
    untilCommand: true,
    elementsBefore: 1,
    syntax: [
      {
        levelEnd: 11,
        allowed: ["$number"],
        codeerror: "hy-execting-number",
      },
      {
        levelStart: 12,
        allowed: ["$number", "$quoted"],
        codeerror: "hy-execting-number-string",
      },
    ],
  },
  {
    text: "-",
    name: "rest",
    description: "Resta dos valors",
    ...operationTemplate,
  },
  {
    text: "*",
    name: "multiplication",
    description: "Multiplica dos valors",
    ...operationTemplate,
  },
  {
    text: "/",
    name: "division",
    description: "Divideix dos valors",
    ...operationTemplate,
  },
  {
    text: "repeat",
    description: "Repeteix un bloc de codi",
    atBegining: true,
    elementsAfter: 2,
    levelStart: 7,
    syntax: [
      {
        allowed: ["$number_integer"],
        position: 1,
        codeerror: "hy-execting-number-integer",
      },
      {
        allowed: ["command_times"],
        position: 2,
        codeerror: "hy-execting-command-times",
      },
    ],
  },
  {
    text: "times",
    description: "Indica quants cops s'ha de repetir un bloc de codi",
    levelStart: 7,
    hasBefore: /^repeat [\p{L}_\d]+/gu,
    elementsAfter: 0,
  },
  {
    text: "for",
    description: "Itera sobre una llista",
    atBegining: true,
    levelStart: 10,
    elementsAfter: 1,
    syntax: [
      {
          allowed: ["condition"],
          codeerror: "hy-execting-condition",
      },
      ],
  },
  {
    text: "range",
    description: "Indica un rang de valors",
    levelStart: 11,
    hasBefore: /^for .* in$/g,
    expected1: "number",
    elementsAfter: 3,
  },
  {
    text: "define",
    description: "Defineix una funció",
    levelStart: 12,
    atBegining: true,
  },
  {
    text: "call",
    description: "Crida una funció",
    levelStart: 12,
    atBegining: false,
  },
  {
    text: "with",
    description: "Indica els arguments d'una funció",
    levelStart: 13,
    hasBefore: /(^define|\bcall) +/g,
  },
  {
    text: ",",
    name: "argument_separator",
    description: "Separa els arguments d'una funció",
    levelStart: 13,
    hasBefore: /\bwith\b/g,
  },
  {
    text: "and",
    description: "Indica que es compleixen dues condicions",
    levelStart: 13,
    expected1: "condition",
    expected_m1: "condition",
    hasBefore: /^(if|elif|while) .*/g,
  },
  {
    text: "or",
    description: "Indica que es compleix una de dues condicions",
    levelStart: 13,
    expected1: "condition",
    expected_m1: "condition",
    hasBefore: /^(if|elif|while) .*/g,
  },
  {
    text: "return",
    description: "Retorna un valor d'una funció",
    levelStart: 14,
    atBegining: true,
    elementsAfter: 1,
  },
  {
    text: ">",
    name: "greater_than",
    description: "Compara si un valor és més gran que un altre",
    levelStart: 14,
  },
  {
    text: "<",
    name: "less_than",
    description: "Compara si un valor és més petit que un altre",
    levelStart: 14,
  },
  {
    text: ">=",
    name: "greater_than_or_equal",
    description: "Compara si un valor és més gran o igual que un altre",
    levelStart: 14,
  },
  {
    text: "<=",
    name: "less_than_or_equal",
    description: "Compara si un valor és més petit o igual que un altre",
    levelStart: 14,
  },
  {
    text: "==",
    name: "compare_equalequal",
    description: "Compara si dos valors són iguals",
    levelStart: 14,
  },
  {
    text: "!=",
    name: "not_equal",
    description: "Compara si dos valors són diferents",
    levelStart: 14,
  },
  {
    text: "while",
    description: "Itera mentre una condició sigui certa",
    levelStart: 15,
    atBegining: true,
    expected: "condition",
    elementsAfter: 1,
  },
  {
    text: "elif",
    description: "Indica una nova condició dins d'un if",
    levelStart: 17,
    atBegining: true,
    elementsAfter: 1,
    expected: "condition",
  },
]);

const hedyGeneralSintaxis = [
  {
    allowed: ["command"],
    special_orAllowed: "definition",
    codeerror: "hy-lines-must-start-with",
    position: 0,
    subphrase: 0,
    highlight: "line",
  },
  {
    refused: ["constant_blank"],
    codeerror: "hy-blanks-not-allowed",
  },
  {
    levelStart: 12,
    refused: ["constant_string_unquoted"],
    codeerror: "hy-text-must-be-quoted",
  },
  {
    levelEnd: 11,
    refused: ["constant_number_decimal"],
    codeerror: "hy-not-decimals",
  },
];

// TODO alguns d'aquests errors s'haurien d'incloure a la sintaxi de comanda
const specificHedyErrors = [
  {
    levelEnd: 1,
    when: "valid",
    hasAfterCommand: /^(?!left|right).+/g,
    highlight: "after_word",
    codeerror: "hy-turn-left-right",
    commands: ["turn"],
  },
  {
    levelEnd: 3,
    when: "valid",
    hasAfterCommand: /^(["']).*\1/g,
    highlight: "after_word",
    codeerror: "hy-unnecessary-quotes",
    commands: ["print", "ask", "echo"],
  },
  {
    when: "invalid",
    hasBeforeCommand: /[\p{L}_\d] +[\p{L}_\d]/gu,
    highlight: "before",
    codeerror: "hy-variabledef-multiplewords",
    commands: ["variable_define_is", "variable_define_equal"],
  },
  {
    levelStart: 6,
    when: "valid",
    highlight: "command",
    hasAfterCommand: /(?!pressed)/g,
    codeerror: "hy-recomended-equal",
    commands: ["compare_is", "variable_define_is"],
  },
  {
    notlist: "after",
    hasBeforeCommand: /(add|remove)\s/g,
    when: "valid",
    highlight: "after_word",
    codeerror: "hy-after-needs-list",
    commands: ["from", "to_list"],
  },
  {
    list: "before",
    hasBeforeCommand: /(add|remove)\s/g,
    when: "valid",
    highlight: "before_word",
    codeerror: "hy-before-needs-nolist",
    commands: ["from", "to_list"],
  },

  {
    hasAfterCommand: /^is\b/g,
    when: "invalid",
    highlight: "command",
    codeerror: "hy-pressed-must-be-second",
    commands: ["pressed"],
  },

  {
    notlist: "before",
    when: "valid",
    highlight: "before_word",
    codeerror: "hy-before-needs-list",
    commands: ["at"],
  },
  {
    special_else: true,
    when: "valid",
    codeerror: "hy-else-elif-needs-if",
    commands: ["else", "elif"],
  },
  {
    notlist: "after",
    hasAfterCommand: /^(?!range)/g,
    when: "valid",
    highlight: "after_word",
    codeerror: "hy-after-needs-list",
    commands: ["in", "not_in"],
  },
  {
    list: "before",
    when: "valid",
    highlight: "before_word",
    codeerror: "hy-before-needs-nolist",
    commands: ["in", "not_in"],
  },
  {
    levelStart: 14,
    when: "valid",
    highlight: "command",
    codeerror: "hy-recomended-equalequal",
    commands: ["compare_equal", "compare_is"],
  },
  {
    list: "before",
    when: "valid",
    highlight: "before_word",
    codeerror: "hy-before-needs-nolist",
    commands: ["sum", "rest", "multiplication", "division"],
  },
  {
    list: "after",
    when: "valid",
    highlight: "after_word",
    codeerror: "hy-after-needs-nolist",
    commands: ["sum", "rest", "multiplication", "division"],
  },
  {
    list: "before",
    when: "valid",
    highlight: "before_word",
    codeerror: "hy-before-needs-nolist",
    commands: [
      "greater_than",
      "less_than",
      "greater_than_or_equal",
      "less_than_or_equal",
      "compare_equalequal",
      "not_equal",
      "compare_is",
      "compare_equal",
    ],
  },
  {
    list: "after",
    when: "valid",
    highlight: "after_word",
    codeerror: "hy-after-needs-nolist",
    commands: [
      "greater_than",
      "less_than",
      "greater_than_or_equal",
      "less_than_or_equal",
      "compare_equalequal",
      "not_equal",
      "compare_is",
      "compare_equal",
    ],
  },
  {
    when: "valid",
    beforeAndAfter: "same",
    highlight: "line",
    codeerror: "hy-same-comparison-true",
    commands: [
      "greater_than_or_equal",
      "less_than_or_equal",
      "compare_equalequal",
      "compare_is",
      "compare_equal",
    ],
  },
  {
    when: "valid",
    beforeAndAfter: "same",
    highlight: "line",
    codeerror: "hy-same-comparison-false",
    commands: ["greater_than", "less_than", "not_equal"],
  },
  {
    when: "valid",
    levelStart: 12,
    beforeAndAfter: "same-type",
    highlight: "line",
    codeerror: "hy-execting-same-type",
    commands: ["sum"],
  },
  {
    when: "valid",
    beforeAndAfter: "same-type",
    highlight: "line",
    codeerror: "hy-execting-same-type",
    commands: [
      "greater_than",
      "less_than",
      "greater_than_or_equal",
      "less_than_or_equal",
      "compare_equalequal",
      "not_equal",
      "compare_is",
      "compare_equal",
    ],
  },
  {
    when: "valid",
    beforeAndAfter: "same-constant-text",
    highlight: "line",
    codeerror: "hy-always-true",
    commands: ["greater_than", "less_than", "not_equal"],
  },
  {
    when: "valid",
    beforeAndAfter: "same-constant-text",
    highlight: "line",
    codeerror: "hy-always-false",
    commands: [
      "greater_than_or_equal",
      "less_than_or_equal",
      "compare_equalequal",
      ,
      "compare_is",
      "compare_equal",
    ],
  },
  {
    commands: ["variable_define_is"],
  },
];

const errorMapping = [
  {
    codeerror: "hy-command-unexpected-argument",
    on: ["if", "elif", "while", "for"],
    to: "hy-command-unexpected-argument-conditional",
  },
  {
    codeerror: "hy-command-missing-argument",
    on: [","], // TODO hauria de ser comma_list
    to: "hy-command-missing-argument-comma",
  },
];

module.exports = {
  hedyCommands,
  specificHedyErrors,
  hedyGeneralSintaxis,
  errorMapping,
};

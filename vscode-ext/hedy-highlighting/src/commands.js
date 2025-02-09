const noCometesWarn = {
    levelEnd: 3,
    when: "command_valid",
    hasAfterCommand: /^(["']).*\1/g,
    message: "En aquest nivell no calen cometes pels textos",
    highlight: "after_command",
    severity: "warning"
  };

const multipleWordError = [{
    when: "invalid",
    hasBeforeCommand: /[\p{L}_\d] +[\p{L}_\d]/gu,
    highlight: "before",
    message: "Per definir una variable només pots fer servir una paraula",
    severity: "error"
  }];

const commandIsDeprecated = {
    levelStart: 6,
    when: "valid",
    highlight: "command",
    hasAfterCommand: /(?!pressed)/g,
    message: "És més recomanable fer servir '=' enlloc de 'is'.",
    severity: "info",
    codeerror: "hedy-equal-instead-of-is"
  }

const fromtoCE = [{
    notlist: "after",
    hasBeforeCommand: /(add|remove)\s/g,
    when: "valid",
    message: "Després de 'add to' o 'remove from' cal una llista",
    highlight: "after_word",
    severity: "warning",
  },
  {
    list: "before",
    hasBeforeCommand: /(add|remove)\s/g,
    when: "valid",
    message: "El format correcte és 'add <item> to <llista>' o 'remove <item> from <llista>'. No pot haver-hi una llista al lloc de l'item.",
    highlight: "before_word",
    severity: "warning",
  }];


const atRandomCE = {
    notlist: "before",
    when: "valid",
    message: "Abans de 'at random' cal una llista",
    highlight: "before_word",
    severity: "warning",
  };

const beforeHasIf = {
    special_else: true,
    when: "valid",
    message: "La comanda 'else' o 'elif' espera que s'hagi usat 'if' anteriorment"
}

const inCE = [{
    notlist: "after",
    hasAfterCommand: /^(?!range)/g,
    when: "valid",
    message: "Després de 'in' cal una llista",
    highlight: "after_word",
    severity: "warning",
  },
  {
    list: "before",
    when: "valid",
    message: "Abans de 'in' no pot haver-hi una llista",
    highlight: "before_word",
    severity: "warning",
  }];

const singleEqualComparationDeprecated = {
    levelStart: 14,
    before: /^(if|while|elif)/,
    hasAfterCommand: /^(?!=)/g,
    when: "valid",
    message: "En aquest nivell ja es pot fer servir '==' enlloc de '='",
    highlight: "command",
    severity: "info",
    codeerror: "hedy-equalequal-instead-of-equal"
  }

const operatorsCE = [{
    list: "before",
    when: "valid",
    message: "Abans d'una operació només pot haver-hi un número o una variable",
    highlight: "before_word",
    severity: "warning"
  },
  {
    list: "after",
    when: "valid",
    message: "Després d'una operació només pot haver-hi un número o una variable",
    highlight: "after_word",
    severity: "warning"
  }];

const comparadorsCE = [{
    list: "before",
    when: "valid",
    message: "Abans d'un comparador no pot haver-hi una llista",
    highlight: "before_word",
    severity: "warning"
  },
  {
    list: "after",
    when: "valid",
    message: "Després d'un comparador no pot haver-hi una llista",
    highlight: "after_word",
    severity: "warning"
  },
  {
    when: "valid",
    hasAfterCommand: /([\p{L}_\d]+)( +is +| *= * | *== *)\b\1\b/gu,
    highlight: "after",
    message: "No té massa sentit comparar dos cops el mateix",
    severity: "warning"
}];

const hedyCommands = [
    {
        name: "print",
        description: "Mostra un text per pantalla",
        beginingSintagma: true,
        commonErrors: [
            noCometesWarn
        ]       
    },
    {
        name: "turn",
        description: "Gira la tortuga",
        beginingSintagma: true,
        commonErrors: [{
            levelEnd: 1,
            when: "command_valid",
            hasAfterCommand: /^(?!left|right).+/g,
            message: "'Aquesta comanda' només accepta 'left' o 'right' en aquest nivell",
            highlight: "after_command",
            severity: "error"
        }
        ]       
    },
    {
        name: "forward",
        description: "Avança la tortuga",
        beginingSintagma: true,
        commonErrors: []
    },
    {
        name: "play",
        description: "Reprodueix una nota",
        beginingSintagma: true,
        commonErrors:[]

    },
    {
        name: "sleep",
        levelStart:2,
        description: "Espera un temps",
        beginingSintagma: true,
        commonErrors:[]

    },
    {
        name: "clear",
        levelStart:4,
        description: "Neteja la pantalla",
        beginingSintagma: true,
        commonErrors:[]

    },
    {
        name: "ask",
        description: "Pregunta a l'usuari i guarda el valor per retornar-lo el pròxim 'echo'",
        beginingSintagma: true,
        levelEnd: 1,
        commonErrors: [
            noCometesWarn
        ]
    },
    {
        name: "ask",
        description: "Pregunta a l'usuari i retorna el valor introduït",
        validAfter: /^[\p{L}_\d]+( +is +| *= *)$/gu,
        levelStart: 2,
        levelEnd: 18,
        commonErrors: [
            noCometesWarn
        ]
    },
    {
        name: "echo",
        description: "Retorna el resultat d'ask per pantalla",
        beginingSintagma: true,
        levelEnd: 1,
        commonErrors: [
            noCometesWarn
        ]
    },
    {
        name: "right",
        description: "Mou la tortuga a la dreta",
        validAfter: /^turn$/g,
        levelEnd: 1,
    },
    {
        name: "left",
        description: "Mou la tortuga a la dreta",
        validAfter: /^turn$/g,
        levelEnd: 1,
    },
    {
        name: "is",
        description: "Defineix una variable",
        tag: "variable_define",
        levelStart: 2,
        validAfter: /^[\p{L}_\d]+ +$/gu,
        commonErrors: [
            multipleWordError
        ]
    },
    {
        name: "is",
        description: "Compara dos valors i/o variables",
        tag: "is_equal",
        levelStart: 2,
        validAfter: /^(if|elif|while) .*/gu,
        commonErrors: [
            commandIsDeprecated,
            ...comparadorsCE
        ]
    },
    {
        name: "remove",
        description: "Elimina un element de una llista, va acompanyat amb 'from'",
        levelStart: 3,
        beginingSintagma: true,
    },
    {
        name: "from",
        description: "Indica de quina llista s'ha d'eliminar un element, va després de 'remove'",
        levelStart: 3,
        validAfter: /^remove +$/g,
        commonErrors: fromtoCE
    },
    {
        name: "add",
        description: "Afegeix un element a una llista, va acompanyat amb 'to'",
        levelStart: 3,
        beginingSintagma: true,
    },
    {
        name: "to",
        tag: "to_list",
        description: "Indica a quina llista s'ha d'afegir un element, va després de 'add'",
        levelStart: 3,
        validAfter: /^add +$/g,
        commonErrors: fromtoCE
    },
    {
        name: "to",
        tag: "to_range",
        description: "Indica fins a quin numero es defineix l'interval, va després de 'range'",
        levelStart: 11,
        validAfter:  /\brange +/g,
    },
    {
        name: "at",
        description: "indica quin element aleteatori de la llista s'ha de seleccionar. presendeix sempre a 'random'",
        levelStart: 3,
        levelEnd: 15,
        validAfter: /[\p{L}_\d]+ +$/gu,
        validBefore: / +random\b/gu,
        commonErrors: [atRandomCE]
    },
    {
        name: "random",
        description: "Indica que s'ha de seleccionar un element aleatori de la llista. Cal posar 'at' abans",
        levelStart: 3,
        levelEnd: 15,
        validAfter: / +at\b/gu,
    },
    {
        name: "random",
        description: "Indica que s'ha de seleccionar un element aleatori de la llista. Va rodejat de claus: '[random]'",
        levelStart: 16,
        validAfter: /\[ */gu,
        validBefore: / *\]/gu,
    },
    {
        name: "if",
        description: "Comença una condició",
        levelStart: 5,
        beginingSintagma: true,
        commonErrors:[
            dobleComparacio
        ]
    },
    {
        name: "else",
        description: "Indica la branca alternativa d'una condició",
        levelStart: 5,
        beginingSintagma: true,
        commonErrors:[
            beforeHasIf
        ]
    },
    {
        name: "pressed",
        description: "Comprova si una tecla està premuda",
        levelStart: 5,
        validAfter: /^if .*is.*/g,
    },
    {
        name:"not",
        tag: "not_in",
        description: "Indica que un element no està a la llista",
        levelStart: 5,
        validAfter: /^if .*/g,
        validBefore: / +in +/g,
    },
    {
        name:"in",
        description: "Indica que un element està a la llista",
        levelStart: 5,
        validAfter: /^(if|elif|for) .*/g,
        commonErrors: inCE
    },
    {
        name: "=",
        tag: "variable_define",
        description: "Defineix una variable",
        levelStart: 6,
        validAfter: /^[\p{L}_\d]+ +$/gu,
        commonErrors: [
            multipleWordError
        ]
    },
    {
        name: "=",
        description: "Compara dos valors i/o variables",
        tag: "is_equal",
        levelStart: 6,
        validAfter: /^(if|elif|while) .*/gu,
        commonErrors: comparadorsCE
    },
    {
        name: "+",
        tag: "sum",
        description: "Suma dos valors",
        levelStart: 6,
        commonErrors: operatorsCE
    },
    {
        name: "-",
        tag: "rest",
        description: "Resta dos valors",
        levelStart: 6,
        commonErrors: operatorsCE
    },
    {
        name:"*",
        tag: "multiplication",
        description: "Multiplica dos valors",
        levelStart: 6,
        commonErrors: operatorsCE
    },
    {
        name:"/",
        tag: "division",
        description: "Divideix dos valors",
        levelStart: 6,
        commonErrors: operatorsCE
    },
    {
        name:"repeat",
        description: "Repeteix un bloc de codi",
        beginingSintagma: true,
        levelStart: 7
    },
    {   name: "times",
        description: "Indica quants cops s'ha de repetir un bloc de codi",
        levelStart: 7,
        validAfter: /^repeat +/g,
    },
    {
        name: "for",
        description: "Itera sobre una llista",
        beginingSintagma: true,
        levelStart: 10,
    },
    {
        name: "range",
        description: "Indica un rang de valors",
        levelStart: 11,
        validAfter: /^for .* in +/g,
    },
    {
        name: "define",
        description: "Defineix una funció",
        levelStart: 12,
        beginingSintagma: true
    },
    { 
        name: "call",
        description: "Crida una funció",
        levelStart: 12,
        beginingSintagma: false
    },
    {
        name: "with",
        description: "Indica els arguments d'una funció",
        levelStart: 13,
        validAfter: /(^define|\bcall) +/g
    },
    {
        name: ",",
        tag: "argument_separator",
        description: "Separa els arguments d'una funció",
        levelStart: 13,
        validAfter: /\bwith\b/g
    },
    {
        name: "and",
        description: "Indica que es compleixen dues condicions",
        levelStart: 13,
        validAfter: /^(if|elif|while) .*/g,
    },
    {
        name: "or",
        description: "Indica que es compleix una de dues condicions",
        levelStart: 13,
        validAfter: /^(if|elif|while) .*/g,
    },
    {
        name: "return",
        description: "Retorna un valor d'una funció",
        levelStart: 14,
        beginingSintagma: true,
    },
    {
        name: ">",
        tag: "greater_than",
        description: "Compara si un valor és més gran que un altre",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {
        name: "<",
        tag: "less_than",
        description: "Compara si un valor és més petit que un altre",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {
        name: ">=",
        tag: "greater_than_or_equal",
        description: "Compara si un valor és més gran o igual que un altre",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {   
        name: "<=",
        tag: "less_than_or_equal",
        description: "Compara si un valor és més petit o igual que un altre",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {
        name : "==",
        tag: "is_equal",
        description: "Compara si dos valors són iguals",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {
        name: "!=",
        tag: "not_equal",
        description: "Compara si dos valors són diferents",
        levelStart: 14,
        commonErrors: comparadorsCE
    },
    {
        name: "while",
        description: "Itera mentre una condició sigui certa",
        levelStart: 15,
        beginingSintagma: true,
    },
    {
        name: "elif",
        description: "Indica una nova condició dins d'un if",
        levelStart: 17,
        beginingSintagma: true,
        commonErrors:[
            beforeHasIf
        ]
    }
]

module.exports = {
    hedyCommands
}
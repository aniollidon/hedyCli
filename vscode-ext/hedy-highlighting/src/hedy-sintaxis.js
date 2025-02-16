class Comand{
    constructor(obj){
        Object.assign(this, obj);
        this.isSymbol = this.name.match("^[a-z]") === null;
        this.rname = this.name.replace(/[+*]/g, '\\$&');
        if(!this.isSymbol) 
            this.rname = `\\b${this.rname}\\b`;

        if(!this.commonErrors)
            this.commonErrors = [];

        if(!this.sintaxis)
            this.sintaxis = [];

        if(!this.tag)
            this.tag = this.name;
    }
}

convertListToComandClass = (comands) => {
    return comands.map((comand) => new Comand(comand));
}


const hedyCommands = convertListToComandClass([
    {
        name: "print",
        description: "Mostra un text per pantalla",
        atBegining: true,
        sintaxis:[
        {
            refused: ["entity_variable_list"],
            codeerror: "hy-cant-print-list"
        },
        {
            levelStart: 4,
            allowed: ["constant_string_quoted", "entity_variable", "at_random"],
            codeerror: "hy-text-must-be-quoted"
        }
        ]      
    },
    {
        name: "turn",
        description: "Gira la tortuga",
        atBegining: true,
        elementsAfter:1,
        sintaxis:[
        {
            levelStart: 2,
            refused: ["constant_string_"],
            codeerror: "hy-execting-number"
        }
        ]    
    },
    {
        name: "forward",
        description: "Avança la tortuga",
        atBegining: true,
        elementsAfter:1,
        expected: ["number"]
    },
    {
        name: "play",
        description: "Reprodueix una nota",
        atBegining: true,
        elementsAfter:1,
        expected: ["note", "number"]
    },
    {
        name: "color",
        description: "Reprodueix una nota",
        atBegining: true,
        elementsAfter:1,
        expected: ["color"]
    },
    {
        name: "sleep",
        levelStart:2,
        description: "Espera un temps",
        atBegining: true,
        elementsAfter:[1, 0],
        expected: ["number"]

    },
    {
        name: "clear",
        levelStart:4,
        description: "Neteja la pantalla",
        atBegining: true,
        elementsAfter: 0

    },
    {
        name: "ask",
        levelEnd: 1,
        description: "Pregunta a l'usuari i guarda el valor per retornar-lo el pròxim 'echo'",
        atBegining: true
    },
    {
        name: "ask",
        description: "Pregunta a l'usuari i retorna el valor introduït",
        hasBefore: /^[\p{L}_\d]+ (is|=)$/gu,
        levelStart: 2,
        levelEnd: 18,
        sintaxis:[
            {
                refused: ["entity_variable_list"],
                codeerror: "hy-cant-print-list"
            },
            {
                levelStart: 4,
                allowed: ["constant_string_quoted", "entity_variable", "at_random"],
                codeerror: "hy-text-must-be-quoted"
            }
        ]
    },
    {
        name: "echo",
        description: "Retorna el resultat d'ask per pantalla",
        atBegining: true,
        levelEnd: 1
    },
    {
        name: "right",
        description: "Mou la tortuga a la dreta",
        hasBefore: /^turn$/g,
        levelEnd: 1,
    },
    {
        name: "left",
        description: "Mou la tortuga a la dreta",
        hasBefore: /^turn$/g,
        levelEnd: 1,
    },
    {
        name: "is",
        description: "Defineix una variable",
        tag: "variable_define_is",
        levelStart: 2,
        hasBefore: /^[\p{L}_\d]+$/gu
    },
    {
        name: "is",
        description: "Compara dos valors i/o variables",
        tag: "compare_is",
        levelStart: 2,
        hasBefore: /^(if|elif|while) .*/gu
    },
    {
        name: ",",
        tag: "comma_list",
        description: "Separa els elements d'una llista",
        levelStart: 3,
        hasBefore: /is |=/g
    },
    {
        name: "remove",
        description: "Elimina un element de una llista, va acompanyat amb 'from'",
        levelStart: 3,
        elementsAfter: 3,
        atBegining: true,
    },
    {
        name: "from",
        description: "Indica de quina llista s'ha d'eliminar un element, va després de 'remove'",
        levelStart: 3,
        hasBefore: /^remove [\p{L}_\d]+$/gu,
        elementsAfter: 1,
    },
    {
        name: "add",
        description: "Afegeix un element a una llista, va acompanyat amb 'to'",
        levelStart: 3,
        elementsAfter: 3,
        atBegining: true,
    },
    {
        name: "to",
        tag: "to_list",
        description: "Indica a quina llista s'ha d'afegir un element, va després de 'add'",
        levelStart: 3,
        hasBefore: /^add [\p{L}_\d]+$/gu,
        elementsAfter: 1
    },
    {
        name: "to",
        tag: "to_range",
        description: "Indica fins a quin numero es defineix l'interval, va després de 'range'",
        levelStart: 11,
        elementsAfter: 1,
        expected: "number",
        hasBefore:  /\brange/g,
    },
    {
        name: "at",
        description: "indica quin element aleteatori de la llista s'ha de seleccionar. presendeix sempre a 'random'",
        levelStart: 3,
        levelEnd: 15,
        hasBefore: /[\p{L}_\d]+$/gu,
        hasAfter: / +random\b/gu,
        elementsAfter: 1
    },
    {
        name: "random",
        description: "Indica que s'ha de seleccionar un element aleatori de la llista. Cal posar 'at' abans",
        levelStart: 3,
        levelEnd: 15,
        elementsAfter: 0,
        hasBefore: /at\b/gu,
    },
    {
        name: "random",
        description: "Indica que s'ha de seleccionar un element aleatori de la llista. Va rodejat de claus: '[random]'",
        levelStart: 16,
        hasBefore: /\[ */gu,
        hasAfter: / *\]/gu,
        elementsAfter: 1,
    },
    {
        name: "if",
        description: "Comença una condició",
        levelStart: 5,
        atBegining: true,
        elementsAfter: 1,
        expected: "condition"
    },
    {
        name: "else",
        description: "Indica la branca alternativa d'una condició",
        levelStart: 5,
        atBegining: true,
        elementsAfter: 1
    },
    {
        name: "pressed",
        description: "Comprova si una tecla està premuda",
        levelStart: 5,
        elementsAfter: 0,
        hasBefore: /^if .*is/g,
    },
    {
        name:"not",
        tag: "not_in",
        description: "Indica que un element no està a la llista",
        levelStart: 5,
        hasBefore: /^if .*/g,
        hasAfter: /\bin\b/g,
        elementsAfter: 2,
    },
    {
        name:"in",
        description: "Indica que un element està a la llista",
        levelStart: 5,
        hasBefore: /^(if|elif|for) .*/g,
        elementsAfter: 1
    },
    {
        name: "=",
        tag: "variable_define_equal",
        description: "Defineix una variable",
        levelStart: 6,
        hasBefore: /^[\p{L}_\d]+$/gu
    },
    {
        name: "=",
        description: "Compara dos valors i/o variables",
        tag: "compare_equal",
        levelStart: 6,
        elementsAfter: 1,
        hasBefore: /^(if|elif|while) .*/gu
    },
    {
        name: "+",
        tag: "sum",
        description: "Suma dos valors",
        levelStart: 6
    },
    {
        name: "-",
        tag: "rest",
        description: "Resta dos valors",
        levelStart: 6
    },
    {
        name:"*",
        tag: "multiplication",
        description: "Multiplica dos valors",
        levelStart: 6
    },
    {
        name:"/",
        tag: "division",
        description: "Divideix dos valors",
        levelStart: 6
    },
    {
        name:"repeat",
        description: "Repeteix un bloc de codi",
        atBegining: true,
        elementsAfter: 2,
        expected1: "number",
        levelStart: 7
    },
    {   name: "times",
        description: "Indica quants cops s'ha de repetir un bloc de codi",
        levelStart: 7,
        hasBefore: /^repeat [\p{L}_\d]+/g,
        elementsAfter: 0,
    },
    {
        name: "for",
        description: "Itera sobre una llista",
        atBegining: true,
        expected: "comparation", // TODO CHECK IN
        levelStart: 10,
        elementsAfter: 1,
    },
    {
        name: "range",
        description: "Indica un rang de valors",
        levelStart: 11,
        hasBefore: /^for .* in$/g,
        expected1: "number",
        elementsAfter: 2,
    },
    {
        name: "define",
        description: "Defineix una funció",
        levelStart: 12,
        atBegining: true
    },
    { 
        name: "call",
        description: "Crida una funció",
        levelStart: 12,
        atBegining: false
    },
    {
        name: "with",
        description: "Indica els arguments d'una funció",
        levelStart: 13,
        hasBefore: /(^define|\bcall) +/g
    },
    {
        name: ",",
        tag: "argument_separator",
        description: "Separa els arguments d'una funció",
        levelStart: 13,
        hasBefore: /\bwith\b/g
    },
    {
        name: "and",
        description: "Indica que es compleixen dues condicions",
        levelStart: 13,
        expected1: "condition",
        expected_m1: "condition",
        hasBefore: /^(if|elif|while) .*/g,
    },
    {
        name: "or",
        description: "Indica que es compleix una de dues condicions",
        levelStart: 13,
        expected1: "condition",
        expected_m1: "condition",
        hasBefore: /^(if|elif|while) .*/g,
    },
    {
        name: "return",
        description: "Retorna un valor d'una funció",
        levelStart: 14,
        atBegining: true,
        elementsAfter: 1,
    },
    {
        name: ">",
        tag: "greater_than",
        description: "Compara si un valor és més gran que un altre",
        levelStart: 14
    },
    {
        name: "<",
        tag: "less_than",
        description: "Compara si un valor és més petit que un altre",
        levelStart: 14
    },
    {
        name: ">=",
        tag: "greater_than_or_equal",
        description: "Compara si un valor és més gran o igual que un altre",
        levelStart: 14
    },
    {   
        name: "<=",
        tag: "less_than_or_equal",
        description: "Compara si un valor és més petit o igual que un altre",
        levelStart: 14
    },
    {
        name : "==",
        tag: "compare_equalequal",
        description: "Compara si dos valors són iguals",
        levelStart: 14
    },
    {
        name: "!=",
        tag: "not_equal",
        description: "Compara si dos valors són diferents",
        levelStart: 14
    },
    {
        name: "while",
        description: "Itera mentre una condició sigui certa",
        levelStart: 15,
        atBegining: true,
        expected: "condition",
        elementsAfter: 1,
    },
    {
        name: "elif",
        description: "Indica una nova condició dins d'un if",
        levelStart: 17,
        atBegining: true,
        elementsAfter: 1,
        expected: "condition"
    }
]);

const hedyGeneralSintaxis = [
    {
        allowed: ["command", "entity_variable"],
        codeerror: "hy-lines-must-start-with",
        position: 0
    },
    {
        refused: ["constant_blank"],
        codeerror: "hy-blanks-not-allowed"
    },
    {
        levelStart: 12,
        refused: ["constant_string_unquoted"],
        codeerror: "hy-text-must-be-quoted"
    },
    {
        levelEnd: 12,
        refused: ["constant_number_decimal"],
        codeerror: "hy-not-decimals"
    }
]

const specificHedyErrors = [
    {
        levelEnd: 1,
        when: "valid",
        hasAfterCommand: /^(?!left|right).+/g,
        highlight: "after_word",
        codeerror: "hy-turn-left-right",
        commands: ["turn"]
    },
    {
        levelEnd: 3,
        when: "valid",
        hasAfterCommand: /^(["']).*\1/g,
        highlight: "after_word",
        codeerror: "hy-unnecessary-quotes",
        commands: ["print", "ask", "echo"]
    },
    {
        when: "invalid",
        hasBeforeCommand: /[\p{L}_\d] +[\p{L}_\d]/gu,
        highlight: "before",
        codeerror: "hy-variabledef-multiplewords",
        commands: ["variable_define_is", "variable_define_equal"]
    },
    {
        levelStart: 6,
        when: "valid",
        highlight: "command",
        hasAfterCommand: /(?!pressed)/g,
        codeerror: "hy-recomended-equal",
        commands: ["compare_is", "variable_define_is"]
    },
    {
        notlist: "after",
        hasBeforeCommand: /(add|remove)\s/g,
        when: "valid",
        highlight: "after_word",
        codeerror: "hy-after-needs-list",
        commands: ["from", "to_list"]
    },
    {
        list: "before",
        hasBeforeCommand: /(add|remove)\s/g,
        when: "valid",
        highlight: "before_word",
        codeerror: "hy-before-needs-nolist",
        commands: ["from", "to_list"]
    },
    {
        notlist: "before",
        when: "valid",
        highlight: "before_word",
        codeerror: "hy-before-needs-list",
        commands: ["at"]
    },
    {
        special_else: true,
        when: "valid",
        codeerror: "hy-else-elif-needs-if",
        commands: ["else", "elif"]
    },
    {
        notlist: "after",
        hasAfterCommand: /^(?!range)/g,
        when: "valid",
        highlight: "after_word",
        codeerror: "hy-after-needs-list",
        commands: ["in"]
    },
    {
        list: "before",
        when: "valid",
        highlight: "before_word",
        codeerror: "hy-before-needs-nolist",
        commands: ["in"]
    },
    {
        levelStart: 14,
        when: "valid",
        highlight: "command",
        codeerror: "hy-recomended-equalequal",
        commands: ["compare_equal", "compare_is"]
    },
    {
        list: "before",
        when: "valid",
        highlight: "before_word",
        codeerror: "hy-before-needs-nolist",
        commands: ["sum", "rest", "multiplication", "division"]
    },
    {
        list: "after",
        when: "valid",
        highlight: "after_word",
        codeerror: "hy-after-needs-nolist",
        commands: ["sum", "rest", "multiplication", "division"]
    },
    {
        list: "before",
        when: "valid",
        highlight: "before_word",
        codeerror: "hy-before-needs-nolist",
        commands: ["greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "compare_equalequal", "not_equal", "compare_is", "compare_equal"]
    },
    {
        list: "after",
        when: "valid",
        highlight: "after_word",
        codeerror: "hy-after-needs-nolist",
        commands: ["greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "compare_equalequal", "not_equal", "compare_is", "compare_equal"]
    },
    {
        when: "valid",
        beforeAndAfter: "same",
        highlight: "after_word",
        codeerror: "hy-same-comparison",
        commands: ["greater_than", "less_than", "greater_than_or_equal", "less_than_or_equal", "compare_equalequal", "not_equal", "compare_is", "compare_equal"]
    }
];

module.exports = {
    hedyCommands,
    specificHedyErrors,
    hedyGeneralSintaxis
}
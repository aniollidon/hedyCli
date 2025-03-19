/*
  Plantilla per definir una comanda:
  + text: Text de la comanda (obligatori)
  + name: Nom de la comanda (default =text)
  + levelStart: Nivell on comença la comanda [inclusiu] (default =1)
  + levelEnd: Nivell on acaba la comanda [inclusiu] (default =17)
  + atBegining: Si la comanda ha d'anar al principi de la línia (default =false)
  + hasBefore: RegEx que ha d'anar abans de la comanda (default =null) <determina validesa>
  + hasAfter: RegEx que ha d'anar després de la comanda (default =null) <determina validesa>
  + argumentsAfter: Número d'elements que ha de tenir la comanda (default = 0 | NO CHECK)
  + argumentsBefore: Número d'elements que ha de tenir la comanda abans (default = 0 | NO CHECK)
  + minArgumentsAfter: Número mínim d'elements que ha de tenir la comanda (default = NO CHECK)
  + minArgumentsBefore: Número mínim d'elements que ha de tenir la comanda abans (default = NO CHECK)
  + concatOn: Quines comandes estàn permeses per concatenar accions. Per exemple 1 + 1 + 2 (default = NO CHECK)
  + arguments: Array amb les restriccions de sintaxi dels elements de la comanda
    + codeerror: Codi de l'error (obligatori)
    + levelStart: Nivell on comença la restricció [inclusiu] (default =1)
    + levelEnd: Nivell on acaba la restricció [inclusiu] (default =17)
    + allowed: Array amb els tags o grup de tags permesos (default = NO CHECK)
    + refused: Array amb els tags o grup de tags permesos (default = NO CHECK)
    + position: Posició de l'argument a comprovar (default =  NO CHECK)


  Grups de tags
  + $number: Número + retorn de numeros (funcions, variables, etc.)
  + number_integer: Número enter + retorn de numeros (funcions, variables, etc.)
  + $string: String + retorn de strings (funcions, variables, etc.)
  + $quoted: String entre cometes + retorn de strings (funcions, variables, etc.)
  + $value: retorns (funcions, variables, etc.)
*/

const operationTemplate = {
  levelStart: 6,
  argumentsAfter: 1,
  argumentsBefore: 1,
  concatOn: ['sum', 'rest', 'multiplication', 'division'],
  arguments: [
    {
      allowed: ['$number'],
      codeerror: 'hy-execting-number',
    },
    {
      refused: ['call_function_return'],
      codeerror: 'hy-warn-function-return-operation',
    },
  ],
}

const commandDefinition = [
  {
    text: 'print',
    atBegining: true,
    minArgumentsAfter: 1,
    arguments: [
      {
        refused: ['entity_variable_list'],
        levelEnd: 15,
        codeerror: 'hy-cant-print-list',
      },
      {
        refused: ['entity_variable_list'],
        levelStart: 16,
        codeerror: 'hy-softwarn-print-list',
      },
      {
        refused: ['entity_function'],
        codeerror: 'hy-cant-print-function',
      },
      {
        levelStart: 4,
        allowed: ['$number', '$quoted'],
        codeerror: 'hy-execting-number-string',
      },
    ],
  },
  {
    text: 'turn',
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        levelStart: 2,
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
    ],
  },
  {
    text: 'forward',
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
    ],
  },
  {
    text: 'play',
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['$number', 'constant_note'],
        codeerror: 'hy-execting-number-note',
      },
    ],
  },
  {
    text: 'color',
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['$value', 'constant_color'],
        codeerror: 'hy-execting-color',
      },
    ],
  },
  {
    text: 'sleep',
    levelStart: 2,
    atBegining: true,
    argumentsAfter: [1, 0],
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
    ],
  },
  {
    text: 'clear',
    levelStart: 4,
    atBegining: true,
    argumentsAfter: 0,
  },
  {
    text: 'ask',
    name: 'ask1',
    levelEnd: 1,
    atBegining: true,
    minArgumentsAfter: 1,
  },
  {
    text: 'ask',
    hasBefore: /^[\p{L}_\d]+ (is|=)$/gu,
    levelStart: 2,
    levelEnd: 18,
    minArgumentsAfter: 1,
    arguments: [
      {
        refused: ['entity_variable_list'],
        levelEnd: 15,
        codeerror: 'hy-cant-print-list',
      },
      {
        refused: ['entity_function'],
        codeerror: 'hy-cant-print-function',
      },
      {
        levelStart: 4,
        allowed: ['$number', '$quoted'],
        codeerror: 'hy-execting-number-string',
      },
    ],
  },
  {
    text: 'echo',
    atBegining: true,
    levelEnd: 1,
    minArgumentsAfter: 1,
  },
  {
    text: 'right',
    hasBefore: /^turn$/g,
    levelEnd: 1,
  },
  {
    text: 'left',
    hasBefore: /^turn$/g,
    levelEnd: 1,
  },
  {
    text: 'is',
    name: 'compare_is',
    levelStart: 2,
    hasBefore: /^(if|elif|while) .*/gu,
    arguments: [
      {
        levelEnd: 11,
        allowed: ['$number', '$string', 'command_pressed'],
        codeerror: 'hy-execting-number-string',
      },
      {
        levelStart: 12,
        allowed: ['$number', '$quoted', 'command_pressed', '$boolean'],
        codeerror: 'hy-execting-number-string',
      },
    ],
  },
  {
    // No hauria d'importar l'ordre, però sino no funciona l'error hy-variabledef-multiplewords
    text: 'is',
    name: 'variable_define_is',
    levelStart: 2,
    argumentsAfter: 1,
    concatOn: ['comma_list'],
    hasBefore: /^[\p{L}\d_]+ *(\[ *[\p{L}\d_]+ *\])?$/gu,
    arguments: [
      {
        levelEnd: 11,
        refused: ['constant_string_quoted'],
        codeerror: 'hy-unnecessary-quotes',
      },
      {
        refused: ['function_call_void'],
        codeerror: 'hy-refused-function-void',
      },
      {
        refused: ['condition'],
        codeerror: 'hy-warn-storing-condition',
      },
    ],
  },
  {
    text: '=',
    name: 'compare_equal',
    levelStart: 6,
    argumentsAfter: 1,
    hasBefore: /^(if|elif|while) .*/gu,
    arguments: [
      {
        levelEnd: 11,
        allowed: ['$number', '$string'],
        codeerror: 'hy-execting-number-string',
      },
      {
        levelStart: 12,
        allowed: ['$number', '$quoted', '$boolean'],
        codeerror: 'hy-execting-number-string',
      },
    ],
  },
  {
    // No hauria d'importar l'ordre, però sino no funciona l'error hy-variabledef-multiplewords
    text: '=',
    name: 'variable_define_equal',
    levelStart: 6,
    argumentsAfter: 1,
    concatOn: ['comma_list'],
    hasBefore: /^[\p{L}\d_]+ *(\[ *[\p{L}\d_]+ *\])?$/gu,
    arguments: [
      {
        levelEnd: 11,
        refused: ['constant_string_quoted'],
        codeerror: 'hy-unnecessary-quotes',
      },
      {
        refused: ['call_function_void'],
        codeerror: 'hy-refused-function-void',
      },
      {
        refused: ['condition'],
        codeerror: 'hy-warn-storing-condition',
      },
    ],
  },
  {
    // no hauria d'importar l'ordre, però sino no funciona l'error de deteccio de comes
    text: ',',
    name: 'comma_argument',
    levelStart: 13,
    hasBefore: /\bwith\b/g,
    argumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['comma_argument'],
  },
  {
    text: ',',
    name: 'comma_list',
    levelStart: 3,
    levelEnd: 15,
    hasBefore: /is |=/g,
    argumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['comma_list'],
    arguments: [
      {
        allowed: ['constant'],
        codeerror: 'hy-list-definition-types',
      },
    ],
  },
  {
    text: ',',
    name: 'comma_bracedlist',
    levelStart: 15,
    hasBefore: /\[/g,
    argumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['comma_bracedlist', 'bracket_close'],
    arguments: [
      {
        refused: ['command_bracket_close'],
        position: 1,
        codeerror: 'hy-command-missing-argument-comma',
      },
    ],
  },
  {
    text: 'remove',
    levelStart: 3,
    argumentsAfter: 3,
    atBegining: true,
  },
  {
    text: 'from',
    levelStart: 3,
    hasBefore: /^remove [\p{L}_\d]+$/gu,
    argumentsAfter: 1,
  },
  {
    text: 'add',
    levelStart: 3,
    argumentsAfter: 3,
    atBegining: true,
  },
  {
    text: 'to',
    name: 'to_list',
    levelStart: 3,
    hasBefore: /^add [\p{L}_\d]+$/gu,
    argumentsAfter: 1,
  },
  {
    text: 'to',
    name: 'to_range',
    levelStart: 11,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        allowed: ['$number_integer'],
        codeerror: 'hy-execting-number-integer',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-limit',
      },
    ],
    hasBefore: /\brange/g,
  },
  {
    text: 'at',
    levelStart: 3,
    levelEnd: 15,
    hasBefore: /[\p{L}_\d]+$/gu,
    hasAfter: /^ *\brandom\b/gu,
    argumentsAfter: 1,
  },
  {
    text: 'random',
    levelStart: 3,
    levelEnd: 15,
    argumentsAfter: 0,
    hasBefore: /at\b/gu,
  },
  {
    text: 'random',
    name: 'random_braced',
    levelStart: 16,
    hasBefore: /\[ */gu,
    hasAfter: / *\]/gu,
    argumentsAfter: 1,
  },
  {
    text: 'if',
    levelStart: 5,
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: 'else',
    levelStart: 5,
    atBegining: true,
    argumentsAfter: 0,
    arguments: [
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: 'pressed',
    levelStart: 5,
    argumentsAfter: 0,
    hasBefore: /^if .*is/g,
  },
  {
    text: 'not',
    levelStart: 5,
    hasBefore: /^if .*/g,
    hasAfter: /\bin\b/g,
  },
  {
    text: 'in',
    levelStart: 5,
    hasBefore: /^(if|elif|for) .*/g,
    argumentsAfter: 1,
  },
  {
    text: '+',
    name: 'sum',
    levelStart: 6,
    argumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['sum', 'rest', 'multiplication', 'division'],
    arguments: [
      {
        levelEnd: 11,
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
      {
        levelStart: 12,
        allowed: ['$number', '$quoted'],
        codeerror: 'hy-execting-number-string',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '-',
    name: 'rest',
    ...operationTemplate,
  },
  {
    text: '*',
    name: 'multiplication',
    ...operationTemplate,
  },
  {
    text: '/',
    name: 'division',
    ...operationTemplate,
  },
  {
    text: 'repeat',
    atBegining: true,
    argumentsAfter: 2,
    levelStart: 7,
    arguments: [
      {
        allowed: ['$number_integer'],
        position: 1,
        codeerror: 'hy-execting-number-integer',
      },
      {
        allowed: ['command_times'],
        position: 2,
        codeerror: 'hy-execting-command-times',
      },
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: 'times',
    levelStart: 7,
    hasBefore: /^repeat [\p{L}_\d]+/gu,
    argumentsAfter: 0,
  },
  {
    text: 'for',
    atBegining: true,
    levelStart: 10,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
    ],
  },
  {
    text: 'range',
    levelStart: 11,
    hasBefore: /^for .* in$/g,
    argumentsAfter: 3,
  },
  {
    text: 'define',
    levelStart: 12,
    atBegining: true,
    minArgumentsAfter: 1,
    arguments: [
      {
        refused: ['constant'],
        codeerror: 'hy-execting-parameter',
      },
      {
        allowed: ['entity_function', 'entity_parameter', 'command_with', 'command_comma_argument'],
        codeerror: 'hy-execting-function-definition',
      },
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: 'call',
    levelStart: 12,
    atBegining: false,
    usesParameters: true,
  },
  {
    text: 'with',
    levelStart: 13,
    hasBefore: /(^define|\bcall) +/g,
    minArgumentsAfter: 1,
  },
  {
    text: 'and',
    levelStart: 13,
    minArgumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['and', 'or'],
    hasBefore: /^(if|elif|while) .*/g,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
    ],
  },
  {
    text: 'or',
    levelStart: 13,
    minArgumentsAfter: 1,
    argumentsBefore: 1,
    concatOn: ['and', 'or'],
    hasBefore: /^(if|elif|while) .*/g,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
    ],
  },
  {
    text: 'return',
    levelStart: 14,
    atBegining: true,
    argumentsAfter: 1,
  },
  {
    text: '>',
    name: 'greater_than',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '<',
    name: 'less_than',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '>=',
    name: 'greater_than_or_equal',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '<=',
    name: 'less_than_or_equal',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        allowed: ['$number'],
        codeerror: 'hy-execting-number',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '==',
    name: 'compare_equalequal',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        levelStart: 12,
        allowed: ['$number', '$quoted', '$boolean'],
        codeerror: 'hy-execting-number-string',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: '!=',
    name: 'not_equal',
    levelStart: 14,
    argumentsAfter: 1,
    argumentsBefore: 1,
    arguments: [
      {
        levelStart: 12,
        allowed: ['$number', '$quoted', '$boolean'],
        refused: ['call'],
        codeerror: 'hy-execting-number-string',
      },
      {
        refused: ['math'],
        codeerror: 'hy-warn-math-operation-compare',
      },
      {
        refused: ['call_function_return'],
        codeerror: 'hy-warn-function-return-operation',
      },
      {
        refused: ['call_at_random'],
        codeerror: 'hy-warn-random-operation',
      },
    ],
  },
  {
    text: 'while',
    levelStart: 15,
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: '[]',
    name: 'list_empty',
    levelStart: 16,
  },
  {
    text: '[',
    name: 'bracket_open_access',
    levelStart: 16,
    argumentsAfter: 1,
    closedBy: 'bracket_close',
    hasBefore: /[\p{L}_\d]+ *$/gu,
    arguments: [
      {
        allowed: ['$number_integer', 'command_bracket_close', 'command_random_braced'],
        codeerror: 'hy-list-access-types',
      },
      {
        allowed: ['command_bracket_close'],
        position: 2,
        codeerror: 'hy-access-brackets-format-arguments',
      },
    ],
  },
  {
    text: '[',
    name: 'bracket_open_definition',
    levelStart: 16,
    argumentsAfter: 1,
    concatOn: ['comma_bracedlist'],
    closedBy: 'bracket_close',
    arguments: [
      {
        allowed: ['constant', 'command_comma', 'command_bracket_close'],
        codeerror: 'hy-list-definition-types',
      },
    ],
  },
  {
    text: ']',
    name: 'bracket_close',
    levelStart: 16,
    minArgumentsBefore: 1,
  },
  {
    text: 'elif',
    levelStart: 17,
    atBegining: true,
    argumentsAfter: 1,
    arguments: [
      {
        allowed: ['condition'],
        codeerror: 'hy-execting-condition',
      },
      {
        closedBy: 'command_colon',
        levelStart: 17,
        codeerror: 'hy-missing-colon',
      },
    ],
  },
  {
    text: ':',
    name: 'colon',
    levelStart: 17,
    argumentsAfter: 0,
  },
]

module.exports = commandDefinition

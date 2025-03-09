/*
  Plantilla per definir regles generals. (pensat per les altres coses que no siguin comandes):
   + codeerror: el codi de l'error que es vol mostrar (obligatori)
    + allowed: Array amb els tags o grup de tags permesos (default = NO CHECK)
    + refused: Array amb els tags o grup de tags no permesos (default = NO CHECK)
    + levelStart: Nivell on comença la comanda [inclusiu] (default =1)
    + levelEnd: Nivell on acaba la comanda [inclusiu] (default =17)
    + subphrase: Subfrase on pertany (default = ANY)
    + positionInSintagma: Comprova a la posició de la paraula en el sintagma (default = NO CHECK)
    + special_orAllowed: Afegeix les definicions a la llista de permesos, [no són una paraula]  (default = NO CHECK)
  */

const hedyGeneralSyntax = [
  {
    allowed: ['call_echo', 'call_function', 'call_ask', 'call_print', 'command', 'declaration'],
    codeerror: 'hy-lines-must-start-with',
    positionInSintagma: 0,
    subphrase: 0,
    highlight: 'line',
  },
  {
    refused: ['call_ask'],
    levelStart: 2,
    codeerror: 'hy-ask-not-in-definition',
    positionInSintagma: 0,
  },
  {
    refused: ['constant_blank'],
    codeerror: 'hy-blanks-not-allowed',
  },
  {
    levelStart: 12,
    refused: ['constant_string_unquoted'],
    codeerror: 'hy-text-must-be-quoted',
  },
  {
    levelEnd: 11,
    refused: ['constant_number_decimal'],
    codeerror: 'hy-not-decimals',
  },
  {
    refused: ['call_function_return'],
    subphrase: 0,
    levelStart: 14,
    codeerror: 'hy-function-return-unused',
  },
]

module.exports = hedyGeneralSyntax

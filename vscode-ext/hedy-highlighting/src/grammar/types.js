const { entreCometes } = require('../utils')

function detectTypeConstant(text, hasNumbers = true, hasBooleans = false) {
  const word = text.trim()

  if (hasBooleans && (word === 'true' || word === 'false' || word === 'True' || word === 'False')) return 'boolean'

  // Si és un número
  if (hasNumbers && !isNaN(word) && !word.startsWith('.')) {
    if (word.includes('.')) return 'number_decimal'
    else return 'number_integer'
  }

  // Pot ser una nota musical
  if (word.match(/^\b(?:C[0-9]|D[0-9]|E[0-9]|F[0-9]|G[0-9]|A[0-9]|B[0-9]|[A-G])\b$/)) return 'note'

  // Pot ser un color
  if (word.match(/\b(blue|green|red|black|brown|gray|orange|pink|purple|white|yellow)\b/)) return 'color'

  // Si comença i acaba per cometes és un string
  if ((word.startsWith('"') && word.endsWith('"')) || (word.startsWith("'") && word.endsWith("'")))
    return 'string_quoted'
  else if (word === '_') return 'blank'
  else return 'string_unquoted'
}

function getType(tag) {
  if (tag.includes('number') || tag.startsWith('math')) return 'number'
  if (tag.includes('string')) return 'string'
  if (tag.includes('color')) return 'color'
  if (tag.includes('note')) return 'note'
  if (tag.startsWith('entity_variable_list')) return 'list'
  return 'mixed'
}

function compareTypes(tag1, tag2) {
  const type1 = getType(tag1)
  const type2 = getType(tag2)
  if (type1 === 'mixed' || type2 === 'mixed') return true
  return type1 === type2
}

function validType(tag, list) {
  for (let i = 0; i < list.length; i++) {
    let valid = false
    if (list[i] === '$number') {
      valid =
        tag.includes('number') ||
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('math') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (list[i] === '$number_integer') {
      valid =
        tag.includes('number_integer') ||
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('math') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (list[i] === '$string') {
      valid =
        tag.includes('string') ||
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (list[i] === '$boolean') {
      valid =
        tag.includes('boolean') ||
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (list[i] === '$quoted') {
      valid =
        tag.includes('string_quoted') ||
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (list[i] === '$value') {
      valid =
        tag.startsWith('entity_variable_value') ||
        tag.startsWith('entity_parameter') ||
        tag.startsWith('call_at_random') ||
        tag.startsWith('call_function_return') ||
        tag.startsWith('list_access')
    } else if (tag.startsWith(list[i])) valid = true

    if (valid) return true
  }

  return false
}

function varDefinitionType(linetext, hasQuotes, hasBooleans, define_var_operator, entities) {
  const isList = enUnaLlista(linetext, linetext.length - 1, hasQuotes, define_var_operator)
  if (isList) return 'list'
  const despresIgual = define_var_operator.includes('=') ? linetext.indexOf('=') + 1 : -1
  const despresIs = define_var_operator.includes('is') ? linetext.indexOf(' is ') + 4 : -1
  const pos = despresIgual > despresIs ? despresIgual : despresIs
  const despres = linetext.substring(pos, linetext.length).trim()

  if (despres.match(/\+|-|\*|\//)) return 'value_mixed'
  if (entities[despres.trim()]) return 'value_mixed'
  if (despres.match(/^ *ask /)) return 'value_mixed'
  if (despres.match(/at random/)) return 'value_mixed'
  if (despres.match(/^ *call /)) return 'value_mixed'

  return 'value_' + detectTypeConstant(despres, true, hasBooleans)
}

function enUnaLlista(text, pos, hasQuotes, define_var_operator) {
  const abans = text.substring(0, pos)
  const despres = text.substring(pos)

  const conteWith = text.indexOf('with')
  const conteCall = text.indexOf('call')
  let abansComa = abans.lastIndexOf(',')
  let abansClaudator = Boolean(abans.match(/(is +|= *)\[/))
  let abansIgual = define_var_operator.includes('=') ? abans.lastIndexOf('=') : -1
  let abansIs = define_var_operator.includes('is') ? abans.lastIndexOf(' is ') : -1

  let despresComa = despres.indexOf(',')

  if (hasQuotes) {
    if (abansComa !== -1 && entreCometes(abans, abansComa)) abansComa = -1
    if (abansIgual !== -1 && entreCometes(abans, abansIgual)) abansIgual = -1
    if (abansIs !== -1 && entreCometes(abans, abansIs)) abansIs = -1
    if (despresComa !== -1 && entreCometes(despres, despresComa)) despresComa = -1
    if (conteWith !== -1 && !entreCometes(text, conteWith) && conteCall !== -1 && !entreCometes(text, conteCall))
      return false
  }

  return (abansComa > 0 || despresComa > 0 || abansClaudator) && (abansIgual > 0 || abansIs > 0)
}

module.exports = {
  detectTypeConstant,
  getType,
  compareTypes,
  validType,
  varDefinitionType,
  enUnaLlista,
}

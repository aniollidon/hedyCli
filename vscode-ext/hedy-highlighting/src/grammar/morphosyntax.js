// TODO detect also partial failed usages
// pex: range | range 1 to
function detectFuctionUsages(tokens, hasAtRandom = false, hasFunctions = false, hasRange = false) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    // ask ... calls
    if (i + 1 < tokens.length && tokens[i].command === 'ask' && !tokens[i + 1].command) {
      const phrase = [tokens[i]]
      i++
      while (i < tokens.length && !tokens[i].command) {
        phrase.push(tokens[i])
        i++
      }
      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'call_ask',
        pos: phrase[0].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'function_usage',
        subphrase: phrase,
      })
    }
    // at random calls
    else if (
      hasAtRandom &&
      i + 2 < tokens.length &&
      !tokens[i].command &&
      tokens[i + 1].tag === 'command_at' &&
      tokens[i + 2].tag === 'command_random'
    ) {
      const phrase = [tokens[i], tokens[i + 1], tokens[i + 2]]
      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'call_at_random',
        pos: tokens[i].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'function_usage',
        subphrase: phrase,
      })
      i += 3
    }
    // range _ to _ calls
    else if (hasRange && tokens[i].command === 'range') {
      let phrase = [tokens[i]]
      let move = 1

      for (let j = i + 1; j < tokens.length && j < i + 4; j++) {
        if (((j === i + 1 || j === i + 3) && !tokens[j].command) || (j === i + 2 && tokens[j].command === 'to_range')) {
          phrase.push(tokens[j])
          move++
        } else {
          break
        }
      }
      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'call_range',
        pos: tokens[i].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'function_usage',
        subphrase: phrase,
      })
      i += move
    }
    // Function calls
    else if (
      hasFunctions &&
      i + 1 < tokens.length &&
      tokens[i].tag === 'command_call' &&
      tokens[i + 1].type === 'entity_function'
    ) {
      const pos = tokens[i].pos
      const phrase = [tokens[i], tokens[i + 1]]
      i += 2

      // Detecta with args
      if (i < tokens.length && tokens[i].tag === 'command_with') {
        phrase.push(tokens[i])
        i++

        let nextargument = true
        while (
          i < tokens.length &&
          nextargument &&
          (tokens[i].tag.startsWith('entity_variable') || tokens[i].tag.startsWith('constant'))
        ) {
          phrase.push(tokens[i])
          i++
          nextargument = false

          if (i < tokens.length && tokens[i].command === 'argument_separator') {
            phrase.push(tokens[i], tokens[i])
            i++
            nextargument = true
          }
        }

        result.push({
          text: phrase.map(token => token.text).join(' '),
          tag: 'call_function',
          pos: pos,
          end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
          type: 'function_usage',
          subphrase: phrase,
        })
      }
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

function detectAndOr(tokens) {
  let result = []
  let i = 0

  const search = new Set(['and', 'or'])

  while (i < tokens.length) {
    if (i + 1 < tokens.length && !tokens[i].command && search.has(tokens[i + 1].command)) {
      let phrase = [tokens[i], tokens[i + 1]]
      let count = 2

      if (i + 2 < tokens.length && !tokens[i + 2].command) {
        phrase.push(tokens[i + 2])
        count++
      }

      while (i + count < tokens.length && tokens[i + count].command && search.has(tokens[i + count].command)) {
        phrase.push(tokens[i + count])
        count++

        if (i + count < tokens.length && !tokens[i + count].command) {
          phrase.push(tokens[i + count])
          count++
        }
      }

      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'condition_' + tokens[i + 1].command,
        pos: tokens[i].pos,
        end: tokens[i + 1].end,
        type: 'condition',
        subphrase: phrase,
      })
      i += count
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

// TODO detect also partial failed conditions
// pex:  a in
function detectConditions(tokens) {
  let result = []
  let i = 0

  // Preprocess to join not_in
  let j = 0
  while (j < tokens.length) {
    if (tokens[j].command === 'not' && j + 1 < tokens.length && tokens[j + 1].command === 'in') {
      tokens[j].text = 'not in'
      tokens[j].tag = 'command_not_in'
      tokens[j].command = 'not_in'
      tokens[j].pos = tokens[j].pos
      tokens[j].end = tokens[j + 1].end
      tokens[j].type = 'command'
      tokens.splice(j + 1, 1)
    } else {
      j++
    }
  }

  const comparators = new Set(['is', '=', '==', '!=', 'in', 'not in', '<', '>', '<=', '>='])

  while (i < tokens.length) {
    if (i + 1 < tokens.length && !tokens[i].command && tokens[i + 1].command && comparators.has(tokens[i + 1].text)) {
      // Evita comparacions en definicions de variables
      const operator = tokens[i + 1].text
      if ((operator === 'is' || operator === '=') && i + 1 === 1) {
        result.push(tokens[i])
        i++
        continue
      }

      let phrase = [tokens[i], tokens[i + 1]]
      let count = 2

      if (i + 2 < tokens.length && (!tokens[i + 2].command || tokens[i + 2].command === 'pressed')) {
        phrase.push(tokens[i + 2])
        count++
      }

      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'condition_' + tokens[i + 1].tag,
        pos: tokens[i].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'condition',
        subphrase: phrase,
      })
      i += count
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

function detectMath(tokens) {
  let result = []
  let i = 0

  const operators = new Set(['+', '-', '*', '/'])

  function allowedType(token) {
    return !token.command
  }

  while (i < tokens.length) {
    if (allowedType(tokens[i])) {
      let phrase = [tokens[i]]
      let pos = tokens[i].pos
      i++

      while (
        i + 1 < tokens.length &&
        tokens[i].command &&
        operators.has(tokens[i].text) &&
        allowedType(tokens[i + 1])
      ) {
        phrase.push(tokens[i], tokens[i + 1])
        i += 2
      }

      if (phrase.length > 1) {
        result.push({
          text: phrase.map(token => token.text).join(' '),
          tag: 'math',
          pos: pos,
          end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
          type: 'operation',
          subphrase: phrase,
        })
      } else {
        result.push(phrase[0])
      }
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

module.exports = {
  detectMath,
  detectFuctionUsages,
  detectConditions,
  detectAndOr,
}

function detectPrintUsages(tokens) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    // (print|echo) ... calls
    if (i + 1 < tokens.length && (tokens[i].command === 'print' || tokens[i].command === 'echo')) {
      const phrase = [tokens[i]]
      i++

      while (i < tokens.length) {
        phrase.push(tokens[i])
        i++
      }

      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'call_' + phrase[0].command,
        pos: phrase[0].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'function_usage',
        subphrase: phrase,
      })
    }
    // ask ... calls
    else if (i + 1 < tokens.length && tokens[i].command === 'ask' && !tokens[i + 1].command) {
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
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

function detectDeclarations(tokens) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    // <var> is|= ... declarations
    if (
      i + 1 < tokens.length &&
      (tokens[i + 1].command === 'variable_define_is' || tokens[i + 1].command === 'variable_define_equal')
    ) {
      const phrase = [tokens[i], tokens[i + 1]]
      i += 2

      while (i < tokens.length) {
        phrase.push(tokens[i])
        i++
      }

      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'declaration',
        pos: phrase[0].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'declaration',
        subphrase: phrase,
      })
    } else {
      result.push(tokens[i])
      i++
    }
  }

  return result
}

function detectBracedList(tokens) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    if (tokens[i].command === 'list_open') {
      let phrase = [tokens[i]]
      i++
      while (i < tokens.length && tokens[i].command !== 'list_close') {
        phrase.push(tokens[i])
        i++
      }
      if (i < tokens.length && tokens[i].command === 'list_close') {
        phrase.push(tokens[i])
        i++
      }
      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'braced_list',
        pos: phrase[0].pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'braced_list',
        subphrase: phrase,
      })
    } else {
      result.push(tokens[i])
      i++
    }
  }
  return result
}

function detectListAccess(tokens) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    if (i + 1 < tokens.length && tokens[i].entity && tokens[i + 1].tag === 'braced_list') {
      let phrase = [tokens[i], tokens[i + 1]]
      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: 'list_access',
        pos: phrase[0].pos,
        end: phrase[1].end,
        type: 'list_access',
        subphrase: phrase,
      })
      i += 2
    } else {
      result.push(tokens[i])
      i++
    }
  }
  return result
}

function detectFuctionUsages(tokens, hasAtRandom = false, hasFunctions = false, hasRange = false) {
  let result = []
  let i = 0

  while (i < tokens.length) {
    // at random calls
    if (
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
    else if (hasFunctions && tokens[i].command === 'call') {
      const pos = tokens[i].pos
      const phrase = [tokens[i]]
      i++

      if (i < tokens.length) {
        phrase.push(tokens[i])
        i++
      }

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

          if (i < tokens.length && tokens[i].text === ',') {
            phrase.push(tokens[i], tokens[i])
            i++
            nextargument = true
          }
        }
      }

      const tag =
        phrase[1] && phrase[1].tag.startsWith('entity_function_return') ? 'call_function_return' : 'call_function_void'

      result.push({
        text: phrase.map(token => token.text).join(' '),
        tag: tag,
        pos: pos,
        end: phrase[phrase.length - 1].pos + phrase[phrase.length - 1].text.length,
        type: 'function_usage',
        subphrase: phrase,
      })
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

function detectMorpho(words, hasAtRandom, hasFunctions, hasRange) {
  words = detectBracedList(words)
  words = detectListAccess(words)
  words = detectMath(words)
  words = detectFuctionUsages(words, hasAtRandom, hasFunctions, hasRange)
  words = detectConditions(words)
  words = detectAndOr(words)
  words = detectPrintUsages(words)
  words = detectDeclarations(words)

  return words
}

module.exports = { detectMorpho }

const lang = require('../lang/lang.js')

const severityAndPriority = {
  'hy-type-context': { severity: 'error', priority: 0 },
  'hy-recomended-equal': { severity: 'info', priority: 0 },
  'hy-recomended-equalequal': { severity: 'info', priority: 0 },
  'hy-entity-changes-content-type': { severity: 'warning', priority: 0 },
  'hy-lines-must-start-with': { severity: 'error', priority: 1 },
  'hy-else-elif-needs-if': { severity: 'error', priority: 1 },
  'hy-execting-number-string': { severity: 'error', priority: 2 },
  'hy-command-missing-argument': { severity: 'error', priority: 3 },
  'hy-command-missing-argument-before': { severity: 'error', priority: 3 },
  'hy-command-unexpected-argument': { severity: 'error', priority: 3 },
  'hy-command-unexpected-argument-conditional': { severity: 'error', priority: 3 },
  'hy-function-missing-argument': { severity: 'error', priority: 3 },
  'hy-function-unexpected-argument': { severity: 'error', priority: 3 },
  'hy-command-missing-argument-comma': { severity: 'error', priority: 4 },
  'hy-ask-not-in-definition': { severity: 'error', priority: 4 },
  'hy-text-must-be-quoted': { severity: 'error', priority: 4 },
  'hy-command-context': { severity: 'error', priority: 5 },
  'hy-refused-function-void': { severity: 'error', priority: 5 },
  'hy-definition-wrong-format': { severity: 'error', priority: 5 },
  'hy-function-return-unused': { severity: 'warning', priority: 5 },
  'hy-level-unavailable-yet': { severity: 'error', priority: 6 },
  'hy-random-usage': { severity: 'error', priority: 6 },
  'hy-at-begining': { severity: 'error', priority: 6 },
  'hy-refused-command-for-print': { severity: 'error', priority: 7 },
  'hy-level-unavailable-deprecated': { severity: 'error', priority: 7 },
  'hy-to-lowercase-command': { severity: 'warning', priority: 7 },
  'hy-entity-out-of-scope': { severity: 'warning', priority: 8 },
  'hy-always-false': { severity: 'warning', priority: 8 },
  'hy-always-true': { severity: 'warning', priority: 8 },
  'hy-same-comparison-true': { severity: 'warning', priority: 9 },
  'hy-same-comparison-false': { severity: 'warning', priority: 9 },
  'hy-execting-same-type': { severity: 'warning', priority: 9 },
  'hy-execting-number': { severity: 'error', priority: 10 },
  'hy-execting-number-integer': { severity: 'error', priority: 10 },
  'hy-execting-command-times': { severity: 'error', priority: 10 },
  'hy-execting-number-note': { severity: 'error', priority: 10 },
  'hy-execting-color': { severity: 'error', priority: 10 },
  'hy-execting-condition': { severity: 'error', priority: 10 },
  'hy-list-definition-types': { severity: 'error', priority: 10 },
  'hy-list-access-types': { severity: 'error', priority: 10 },
  'hy-bracket-needs-before-list': { severity: 'warning', priority: 10 },
  'hy-use-elseif-instead': { severity: 'warning', priority: 10 },
  'hy-execting-function-definition': { severity: 'error', priority: 10 },
  'hy-comma-list-needs-brackets': { severity: 'error', priority: 10 },
  'hy-access-brackets-format-arguments': { severity: 'error', priority: 11 },
  'hy-execting-parameter': { severity: 'error', priority: 11 },
  'hy-entitydef-starts-with-number': { severity: 'error', priority: 20 },
  'hy-warn-random-operation': { severity: 'warning', priority: 20 },
  'hy-warn-function-return-operation': { severity: 'warning', priority: 20 },
  'hy-warn-storing-condition': { severity: 'warning', priority: 20 },
  'hy-warn-math-operation-compare': { severity: 'warning', priority: 20 },
  'hy-warn-math-operation-limit': { severity: 'warning', priority: 20 },
  'hy-warn-or-and-exclusive-condition': { severity: 'warning', priority: 20 },
  'hy-warn-access-set-operation': { severity: 'warning', priority: 20 },
  'hy-after-needs-list': { severity: 'warning', priority: 50 },
  'hy-before-needs-list': { severity: 'warning', priority: 50 },
  'hy-after-needs-nolist': { severity: 'warning', priority: 50 },
  'hy-before-needs-nolist': { severity: 'warning', priority: 50 },
  'hy-cant-print-list': { severity: 'warning', priority: 50 },
  'hy-softwarn-print-list': { severity: 'info', priority: 50 },
  'hy-pressed-needs-is': { severity: 'warning', priority: 50 },
  'hy-cant-print-function': { severity: 'warning', priority: 50 },
  'hy-add-remove-notlist': { severity: 'warning', priority: 50 },
  'hy-pressed-must-be-second': { severity: 'warning', priority: 100 },
  'hy-turn-left-right': { severity: 'error', priority: 100 },
  'hy-variabledef-multiplewords': { severity: 'error', priority: 100 },
  'hy-not-decimals': { severity: 'error', priority: 100 },
  'hy-bad-definition-for-is': { severity: 'error', priority: 100 },
  'hy-function-argument-duplicated': { severity: 'warning', priority: 100 },
  'hy-identation-not-expected': { severity: 'error', priority: 254 },
  'hy-identation-expected': { severity: 'error', priority: 254 },
  'hy-fileends-identation-expected': { severity: 'error', priority: 254 },
  'hy-identation-large': { severity: 'error', priority: 254 },
  'hy-identation-small': { severity: 'error', priority: 254 },
  'hy-identation-misalignment': { severity: 'error', priority: 254 },
  'hy-identation-multiple-unavailable': { severity: 'error', priority: 254 },
  'hy-unnecessary-quotes': { severity: 'info', priority: 255 },
  'hy-list-open-needs-close': { severity: 'error', priority: 254 },
  'hy-bracket-open-needs-close': { severity: 'error', priority: 254 },
  'hy-expecting-close': { severity: 'error', priority: 254 },
  'hy-not-expecting-coma-final': { severity: 'error', priority: 254 },
  'hy-missing-colon': { severity: 'error', priority: 254 },
  'hy-blanks-not-allowed': { severity: 'error', priority: 255 },
}

class HHError {
  constructor(onText, errorCode, start, end) {
    this.onText = onText
    this.errorCode = errorCode
    this.start = start
    this.end = end
    this.set(errorCode)
  }

  set(errorCode) {
    this.errorCode = errorCode
    this.priority = severityAndPriority[this.errorCode].priority
    this.severity = severityAndPriority[this.errorCode].severity
    this.translation = lang.error2text(this.errorCode)
  }

  getMessage() {
    let message = this.translation.message
    message = this._process_messsage(message)
    return message
  }

  _process_messsage(message) {
    message = message.replace('[NAME]', this.onText)
    message = message.replace('[LOWER]', this.onText.toLowerCase())
    return message
  }

  get() {
    return {
      message: this.getMessage(),
      start: this.start,
      end: this.end,
      codeerror: this.errorCode,
      severity: this.severity,
    }
  }
}

class HHErrorVal extends HHError {
  constructor(onText, errorCode, start, end, value) {
    super(onText, errorCode, start, end)
    this.value = value
  }

  _process_messsage(message) {
    if (this.value !== undefined) {
      if (this.value === 0) {
        message = this.translation.messageZero
      } else if (this.value > 1) {
        message = this.translation.messagePlural
      }
      message = message.replace('[VALUE]', this.value)
    }
    message = super._process_messsage(message)
    return message
  }
}

class HHErrorVals extends HHError {
  constructor(onText, errorCode, start, end, values) {
    super(onText, errorCode, start, end)
    this.values = values
  }

  _process_messsage(message) {
    for (let key in this.values) {
      message = message.replaceAll(`[${key}]`, this.values[key])
    }
    message = super._process_messsage(message)
    return message
  }
}
class HHErrorType extends HHError {
  constructor(onText, errorCode, start, end, type) {
    super(onText, errorCode, start, end)
    this.type = type
  }

  _process_messsage(message) {
    message = message.replace('[TYPE]', lang.type2text(this.type))
    message = message.replace('[LOWERTYPE]', lang.type2text(this.type).toLowerCase())
    message = super._process_messsage(message)
    return message
  }
}

class HHErrorLine extends HHError {
  constructor(onText, errorCode, start, end, lineNumber) {
    super(onText, errorCode, start, end)
    this.lineNumber = lineNumber
  }

  _process_messsage(message) {
    message = message.replace('[LINE]', this.lineNumber + 1)
    message = super._process_messsage(message)
    return message
  }
}

module.exports = {
  HHError,
  HHErrorVal,
  HHErrorVals,
  HHErrorType,
  HHErrorLine,
}

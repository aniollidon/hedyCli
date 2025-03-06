const lang = require('../lang/catala.js')

const severityAndPriority = {
  'hy-context': {
    severity: 'error',
    priority: 0,
  },
  'hy-recomended-equal': {
    severity: 'info',
    priority: 0,
  },
  'hy-lines-must-start-with': {
    severity: 'error',
    priority: 0,
  },
  'hy-text-must-be-quoted': {
    severity: 'error',
    priority: 0,
  },
  'hy-recomended-equalequal': {
    severity: 'info',
    priority: 0,
  },
  'hy-entity-changes-content-type': {
    severity: 'warning',
    priority: 0,
  },
  'hy-at-begining': {
    severity: 'error',
    priority: 1,
  },
  'hy-command-missing-argument': {
    severity: 'error',
    priority: 1,
  },
  'hy-command-missing-argument-before': {
    severity: 'error',
    priority: 1,
  },
  'hy-command-unexpected-argument': {
    severity: 'error',
    priority: 1,
  },
  'hy-command-unexpected-argument-conditional': {
    severity: 'error',
    priority: 1,
  },
  'hy-execting-function-definition': {
    severity: 'error',
    priority: 1,
  },
  'hy-command-missing-argument-comma': {
    severity: 'error',
    priority: 1,
  },
  'hy-ask-not-in-definition': {
    severity: 'error',
    priority: 1,
  },
  'hy-level-unavailable-yet': {
    severity: 'error',
    priority: 2,
  },
  'hy-level-unavailable-deprecated': {
    severity: 'error',
    priority: 2,
  },
  'hy-to-lowercase-command': {
    severity: 'warning',
    priority: 3,
  },
  'hy-entity-out-of-scope': {
    severity: 'warning',
    priority: 5,
  },
  'hy-always-false': {
    severity: 'warning',
    priority: 5,
  },
  'hy-always-true': {
    severity: 'warning',
    priority: 5,
  },
  'hy-same-comparison-true': {
    severity: 'warning',
    priority: 6,
  },
  'hy-same-comparison-false': {
    severity: 'warning',
    priority: 6,
  },
  'hy-execting-same-type': {
    severity: 'warning',
    priority: 6,
  },
  'hy-execting-number': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-number-integer': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-command-times': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-number-string': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-number-note': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-color': {
    severity: 'error',
    priority: 10,
  },
  'hy-execting-condition': {
    severity: 'error',
    priority: 10,
  },
  'hy-use-elseif-instead': {
    severity: 'warning',
    priority: 10,
  },
  'hy-after-needs-list': {
    severity: 'warning',
    priority: 50,
  },
  'hy-before-needs-list': {
    severity: 'warning',
    priority: 50,
  },
  'hy-after-needs-nolist': {
    severity: 'warning',
    priority: 50,
  },
  'hy-before-needs-nolist': {
    severity: 'warning',
    priority: 50,
  },
  'hy-cant-print-list': {
    severity: 'warning',
    priority: 50,
  },
  'hy-pressed-needs-is': {
    severity: 'warning',
    priority: 50,
  },
  'hy-cant-print-function': {
    severity: 'warning',
    priority: 50,
  },
  'hy-add-remove-notlist': {
    severity: 'warning',
    priority: 50,
  },
  'hy-pressed-must-be-second': {
    severity: 'warning',
    priority: 100,
  },
  'hy-turn-left-right': {
    severity: 'error',
    priority: 100,
  },
  'hy-variabledef-multiplewords': {
    severity: 'error',
    priority: 100,
  },
  'hy-not-decimals': {
    severity: 'error',
    priority: 100,
  },
  'hy-else-elif-needs-if': {
    severity: 'error',
    priority: 100,
  },
  'hy-blanks-not-allowed': {
    severity: 'error',
    priority: 255,
  },
  'hy-identation': {
    severity: 'error',
    priority: 255,
  },
  'hy-identation-multiple-unavailable': {
    severity: 'error',
    priority: 255,
  },
  'hy-unnecessary-quotes': {
    severity: 'info',
    priority: 255,
  },
  'hy-entitydef-starts-with-number': {
    severity: 'error',
    priority: 255,
  },
  'hy-function-argument-duplicated': {
    severity: 'warning',
    priority: 255,
  },
  'hy-call-function-arguments': {
    severity: 'error',
    priority: 255,
  },
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

class HHErrorType extends HHError {
  constructor(onText, errorCode, start, end, type) {
    super(onText, errorCode, start, end)
    this.type = type
  }

  _process_messsage(message) {
    const extra = "S'ha trobat " + lang.type2text(this.type)
    message = message.replace('[TYPE-FOUND]', extra)
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
  HHErrorType,
  HHErrorLine,
}

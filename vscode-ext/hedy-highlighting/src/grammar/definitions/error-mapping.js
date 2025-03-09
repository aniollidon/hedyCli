const errorMapping = [
  {
    codeerror: 'hy-command-unexpected-argument',
    on: ['if', 'elif', 'while', 'for'],
    to: 'hy-command-unexpected-argument-conditional',
  },
  {
    codeerror: 'hy-command-missing-argument',
    on: [','], // TODO hauria de ser comma_list
    to: 'hy-command-missing-argument-comma',
  },
  {
    codeerror: 'hy-command-context',
    on: ['ask'],
    to: 'hy-ask-not-in-definition',
  },
  {
    codeerror: 'hy-level-unavailable-yet',
    on: ['random'],
    to: 'hy-random-usage',
  },
]

module.exports = errorMapping

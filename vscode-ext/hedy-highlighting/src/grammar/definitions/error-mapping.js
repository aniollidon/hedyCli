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
    codeerror: 'hy-context',
    on: ['ask'],
    to: 'hy-ask-not-in-definition',
  },
]

module.exports = errorMapping

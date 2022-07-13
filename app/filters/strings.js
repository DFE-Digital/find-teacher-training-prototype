// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const _ = require('lodash')
const marked = require('marked')
const string = require('string')

// Leave this filters line
const filters = {}

// Create url / slugs from text
// This is a heading => this-is-a-heading
filters.slugify = (input) => {
  if (!input) throw 'Error in slugify: no input', input
  else return string(input).slugify().toString()
}

// Split a string using a separator
filters.split = (string, separator) => {
  if (!string || typeof string !== 'string') return
  else return string.split(separator)
}

// Hyphen separate a string
// This is a string => this-is-a-string
filters.kebabCase = (string) => {
  return string.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase()
}

// Sentence case - uppercase first latter
filters.sentenceCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)) {
    return input.charAt(0).toUpperCase() + input.slice(1)
  } else return input
}

filters.startLowerCase = (input) => {
  if (!input) return '' // avoid printing false to client
  if (_.isString(input)) {
    return input.charAt(0).toLowerCase() + input.slice(1)
  } else return input
}

// Is it a string or not?
filters.isString = str => {
  const isString = _.isString(str)
  return _.isString(str)
}

// Assessment only => an Assesment only
// Provider-led => a provider led
filters.prependWithAOrAn = string => {
  const vowelRegex = '^[aieouAIEOU].*'
  const matched = string.match(vowelRegex)
  if (matched) {
    return `an ${string}`
  } else {
    return `a ${string}`
  }
}

// Format a number as £x,xxx
filters.currency = input => {
  const inputAsInt = parseInt(input, 10)
  function numberWithCommas (x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }
  if (inputAsInt > 0) { return `£${numberWithCommas(inputAsInt)}` }

  // makes negative number positive and puts minus sign in front of £
  else if (inputAsInt < 0) { return `–£${numberWithCommas(inputAsInt * -1)}` } else return ''
}

// Emulate support for string literals in Nunjucks
// Usage:
// {{ 'The count is ${count}' | stringLiteral }}
filters.stringLiteral = (str) => {
  return (new Function('with (this) { return `' + str + '` }')).call(this.ctx)
}

// Format text using markdown
// Documentation at https://marked.js.org/
filters.markDown = input => {
  marked.setOptions({
  })
  return marked(input)
}

// Checks if a string starts with something
filters.startsWith = (string, target) => {
  if (typeof string === 'string') {
    return string.startsWith(target)
  } else {
    return false
  }
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

const { DateTime } = require('luxon')
const marked = require('marked')

marked.setOptions({
  renderer: new marked.Renderer(),
  smartLists: true,
  smartypants: true
})

module.exports = (env) => {
  const filters = {}

  filters.push = (array, item) => {
    array.push(item)
    return array
  }

  /**
   * Convert string to date
   *
   * @param {String} string Date
   * @param {String} format Date format
   */
  filters.date = (string, format = 'yyyy-LL-dd') => {
    if (string) {
      const date = (string === 'now') ? DateTime.local() : string

      const datetime = DateTime.fromISO(date, {
        locale: 'en-GB'
      }).toFormat(format)

      return datetime
    }
  }

  /**
   * Convert Markdown string to HTML
   *
   * @param {String} string Markdown
   */
  filters.markdown = (string, value) => {
    if (!string) {
      return ''
    }

    if (value === 'inline') {
      return marked.parseInline(string)
    }

    const text = string.replace(/\\r/g, '\n').replace(/\\t/g, ' ')
    const html = marked(text)

    // Add govuk-* classes
    let govukHtml = html.replace(/<p>/g, '<p class="govuk-body">')
    govukHtml = govukHtml.replace(/<ol>/g, '<ol class="govuk-list govuk-list--number">')
    govukHtml = govukHtml.replace(/<ul>/g, '<ul class="govuk-list govuk-list--bullet">')
    govukHtml = govukHtml.replace(/<h2/g, '<h2 class="govuk-heading-l"')
    govukHtml = govukHtml.replace(/<h3/g, '<h3 class="govuk-heading-m"')
    govukHtml = govukHtml.replace(/<h4/g, '<h4 class="govuk-heading-s"')

    return govukHtml
  }

  /**
   * Convert array to readable list format using 'and'
   * @param {Array} array Array to convert
   * @example [A, B, C] => A, B and C
   */
  filters.formatList = (array = []) => {
    const lf = new Intl.ListFormat('en')
    return lf.format(array)
  }

  /**
   * Convert array to readable list format using 'or'
   * @param {Array} array Array to convert
   * @example [A, B, C] => A, B or C
   */
  filters.formatOrList = (array = []) => {
    const lf = new Intl.ListFormat('en', { style: 'short', type: 'disjunction' })
    return lf.format(array)
  }

  /**
   * Convert object to array
   * @param {Object} object Object to convert
   */
  filters.toArray = object => {
    if (object) {
      const arr = []
      for (const [key, value] of Object.entries(object)) {
        value.id = key
        arr.push(value)
      }
      return arr
    }
  }

  /**
   * Create a new array or string containing only a specified number of elements
   * @see https://gist.github.com/jbmoelker/9693778
   *
   * @param {String|Array} input Text or list of items to shorten
   * @param {Number} limit Either positive offset from start or negative offset from end
   *
   * @example <caption>Limit to first 5 characters of string</caption>
   *   {{ "hello world" | limitTo(5) }}
   *   // outputs: hello
   *
   * @example <caption>Limit to last 5 characters of string</caption>
   *   {{ "hello world" | limitTo(-5) }}
   *   // outputs: world
   *
   * @example <caption>Limit to first 3 items in array</caption>
   *   {% set items = ["alpha","beta","charlie","delta","echo"] %}
   *   {% for item in items | limitTo(3) %} {{ loop.index }}.{{ item }} {% endfor %}
   *   // outputs: 1.alpha 2.beta  3.charlie
   *
   * @example <caption>Limit to last 3 items in array</caption>
   *   {% set items = ["alpha","beta","charlie","delta","echo"] %}
   *   {% for item in items | limitTo(-3) %} {{ loop.index }}.{{ item }} {% endfor %}
   *   // outputs: 1.charlie 2.delta 3.echo
   */
  filters.limitTo = (input, limit) => {
    if (typeof limit !== 'number') {
      return input
    }

    if (typeof input === 'string') {
      if (limit >= 0) {
        return input.substring(0, limit)
      } else {
        return input.substr(limit)
      }
    }

    if (Array.isArray(input)) {
      limit = Math.min(limit, input.length)
      if (limit >= 0) {
        return input.splice(0, limit)
      } else {
        return input.splice(input.length + limit, input.length)
      }
    }

    return input
  }

  return filters
}

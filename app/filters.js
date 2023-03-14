const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const { DateTime } = require('luxon')
const marked = require('marked')
const numeral = require('numeral')

const utilsHelper = require('./helpers/utils')

marked.setOptions({
  renderer: new marked.Renderer(),
  smartLists: true,
  smartypants: true
})

const individualFiltersFolder = path.join(__dirname, './filters')

module.exports = (env) => {
  const filters = {}

  // Import filters from filters folder
  if (fs.existsSync(individualFiltersFolder)) {
    const files = fs.readdirSync(individualFiltersFolder)
    files.forEach(file => {
      const fileData = require(path.join(individualFiltersFolder, file))
      // Loop through each exported function in file (likely just one)
      Object.keys(fileData).forEach((filterGroup) => {
        // Get each method from the file
        Object.keys(fileData[filterGroup]).forEach(filterName => {
          filters[filterName] = fileData[filterGroup][filterName]
        })
      })
    })
  }

  filters.includes = (route, string) => {
    if (route && route.includes(string)) {
      return true
    } else {
      return false
    }
  }

  /**
   * Convert string to date
   *
   * @param {String} string Date
   * @param {String} format Date format
   */
  // filters.date = (string, format = 'yyyy-LL-dd') => {
  //   if (string) {
  //     const date = (string === 'now') ? DateTime.local() : string
  //
  //     const datetime = DateTime.fromISO(date, {
  //       locale: 'en-GB'
  //     }).toFormat(format)
  //
  //     return datetime
  //   }
  // }

  /* ------------------------------------------------------------------
  utility function to return true or false
  example: {{ 'yes' | falsify }}
  outputs: true
  ------------------------------------------------------------------ */
  filters.falsify = (input) => {
    if (_.isNumber(input)) return input
    else if (input == false) return false
    if (_.isString(input)) {
      const truthyValues = ['yes', 'true']
      const falsyValues = ['no', 'false']
      if (truthyValues.includes(input.toLowerCase())) return true
      else if (falsyValues.includes(input.toLowerCase())) return false
    }
    return input
  }

  /* ------------------------------------------------------------------
   numeral filter for use in Nunjucks
   example: {{ params.number | numeral("0,00.0") }}
   outputs: 1,000.00
  ------------------------------------------------------------------ */
  filters.numeral = (number, format) => {
    return numeral(number).format(format)
  }

  /* ------------------------------------------------------------------
  utility function to get the remainder when one operand is divided by
  a second operand
  example: {{ 4 | remainder(2) }}
  outputs: 0
  ------------------------------------------------------------------ */
  filters.remainder = (dividend, divisor) => {
    return dividend % divisor
  }

  /* ------------------------------------------------------------------
  utility function to get an error for a component
  example: {{ errors | getErrorMessage('title') }}
  outputs: "Enter a title"
  ------------------------------------------------------------------ */
  filters.getErrorMessage = function (array, fieldName) {
    if (!array || !fieldName) {
      return null
    }

    const error = array.filter((obj) =>
      obj.fieldName === fieldName
    )[0]

    return error
  }

  /* ------------------------------------------------------------------
  Convert Markdown string to HTML
  @param {String} string Markdown
  ------------------------------------------------------------------ */
  filters.markdown = (string, value) => {
    if (!string) {
      return ''
    }

    if (value === 'inline') {
      return marked.parseInline(string)
    }

    const text = string.replace(/\\r/g, '\n').replace(/\\t/g, ' ')
    const html = marked.parse(text)

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

  /* ------------------------------------------------------------------
  utility function to get the academic year label
  example: {{ "September 2022" | getAcademicYearLabel }}
  outputs: "Academic year 2022 to 2023"
  ------------------------------------------------------------------ */
  filters.getAcademicYearLabel = (date) => {
    let label = ''

    if (date) {
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

      // the date is a string 'September 2022' so we need to split into useful parts
      const dateParts = date.split(' ')

      // get the month
      let checkMonth = dateParts[0]
      // convert the month into a number
      checkMonth = months.indexOf(checkMonth.toLowerCase()) + 1
      checkMonth = numeral(checkMonth).format('00')

      // get the year
      const checkYear = dateParts[1]

      // reconstruct the date
      let checkDate = checkYear + '-' + checkMonth
      checkDate = DateTime.fromISO(checkDate)

      // construct the academic year
      const startDate = DateTime.fromISO(checkDate.year + '-08-01T00:00:00')
      const endDate = DateTime.fromISO((checkDate.year + 1) + '-07-31T23:59:59')

      // get the academic year boundaries
      if (checkDate >= startDate && checkDate <= endDate) {
        label = checkDate.year + ' to ' + (checkDate.year + 1)
      } else {
        label = (checkDate.year - 1) + ' to ' + checkDate.year
      }
    }

    return label
  }

  /* ------------------------------------------------------------------
  utility function to get the course length label
  example: {{ 'OneYear' | getCourseLengthLabel }}
  outputs: "One year"
  ------------------------------------------------------------------ */
  filters.getCourseLengthLabel = (length) => {
    let label

    switch (length) {
      case 'OneYear':
        label = '1 year'
        break
      case 'TwoYears':
        label = 'Up to 2 years'
        break
      default:
        label = length
    }

    return label
  }

  /* ------------------------------------------------------------------
  utility function to get the qualification label
  example: {{ 'pgce_with_qts' | getQualificationLabel }}
  outputs: "PGCE with QTS"
  ------------------------------------------------------------------ */
  filters.getQualificationLabel = (qualificationCode = null, type = null) => {
    return utilsHelper.getQualificationLabel(qualificationCode, type)
  }

  /* ------------------------------------------------------------------
  utility function to get the study mode label
  example: {{ 'both' | getStudyModeLabel }}
  outputs: "Full time or part time"
  ------------------------------------------------------------------ */
  filters.getStudyModeLabel = (studyMode) => {
    let label

    switch (studyMode) {
      case 'full_time':
        label = 'Full time'
        break
      case 'part_time':
        label = 'Part time'
        break
      default:
        label = 'Full time or part time'
    }

    return label
  }

  /* ------------------------------------------------------------------
  utility function to get the subject label
  example: {{ 'F3' | getSubjectLabel }}
  outputs: "Physics"
  ------------------------------------------------------------------ */
  filters.getSubjectLabel = (subjectCode, toLowerCase) => {
    return utilsHelper.getSubjectLabel(subjectCode, toLowerCase)
  }

  /* ------------------------------------------------------------------
  utility function to get the provider type label
  example: {{ 'scitt' | getProviderTypeLabel }}
  outputs: "School Centred Initial Teacher Training (SCITT)"
  ------------------------------------------------------------------ */
  filters.getProviderTypeLabel = (providerTypeCode, longName) => {
    return utilsHelper.getProviderTypeLabel(providerTypeCode, longName)
  }

  /* ------------------------------------------------------------------
  utility function to get the funding type label
  example: {{ 'include' | getFundingTypeLabel }}
  outputs: "Only show courses with a salary"
  ------------------------------------------------------------------ */
  filters.getFundingTypeLabel = (fundingTypeCode, sectionName) => {
    return utilsHelper.getFundingTypeLabel(fundingTypeCode, sectionName)
  }

  /* ------------------------------------------------------------------
  utility function to get the visa sponsorship label
  example: {{ 'include' | getVisaSponsorshipLabel }}
  outputs: "Only show courses with visa sponsorship"
  ------------------------------------------------------------------ */
  filters.getVisaSponsorshipLabel = (visaSponsorshipCode, sectionName) => {
    return utilsHelper.getVisaSponsorshipLabel(visaSponsorshipCode, sectionName)
  }

  /* ------------------------------------------------------------------
  utility function to get the region label
  example: {{ 'north_west' | getRegionLabel }}
  outputs: "North West"
  ------------------------------------------------------------------ */
  filters.getRegionLabel = (regionCode) => {
    return utilsHelper.getRegionLabel(regionCode)
  }

  /* ------------------------------------------------------------------
  utility function to get the accredited body label
  example: {{ 'include' | getAccreditedBodyLabel }}
  outputs: "Only show accredited bodies"
  ------------------------------------------------------------------ */
  filters.getAccreditedBodyLabel = (accreditedBodyCode) => {
    return utilsHelper.getAccreditedBodyLabel(accreditedBodyCode)
  }

  /* ------------------------------------------------------------------
  utility function to get the subject list
  example: {{ [F3,G1] | getSubjectList }}
  outputs: "physics and mathematics"
  ------------------------------------------------------------------ */
  filters.getSubjectList = (subjectCodes, join = ', ', final = ' and ') => {
    let list = subjectCodes

    const subjects = []

    subjectCodes.forEach((subjectCode, i) => {
      subjects.push(filters.getSubjectLabel(subjectCode,true))
    })

    list = filters.arrayToList(subjects, join, final)

    return list
  }

  /* ------------------------------------------------------------------
  utility function to turn and array into a list
  example: {{ ['primary','secondary'] | arrayToList }}
  outputs: "primary and secondary"
  ------------------------------------------------------------------ */
  filters.arrayToList = (array, join = ', ', final = ' and ') => {
    const arr = array.slice(0)

    const last = arr.pop()

    if (array.length > 1) {
      return arr.join(join) + final + last
    }

    return last
  }

  return filters
}

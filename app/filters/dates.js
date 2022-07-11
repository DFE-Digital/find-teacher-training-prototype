// -------------------------------------------------------------------
// Imports and setup
// -------------------------------------------------------------------
const { DateTime } = require('luxon')

// Leave this filters line
const filters = {}

/* ------------------------------------------------------------------
 date filter for use in Nunjucks
 example: {{ params.date | date("DD/MM/YYYY") }}
 outputs: 01/01/1970
------------------------------------------------------------------ */
filters.date = (timestamp, format = 'yyyy-LL-dd') => {
  let datetime = DateTime.fromJSDate(timestamp, {
    locale: 'en-GB'
  }).toFormat(format)

  if (datetime === 'Invalid DateTime') {
    datetime = DateTime.fromISO(timestamp, {
      locale: 'en-GB'
    }).toFormat(format)
  }

  return datetime
}

/*
  ====================================================================
  govukDate
  --------------------------------------------------------------------
  Process a date and return it in GOV.UK format
  Accepts arrays (as provided by design system date inputs) as
  well as javascript dates
  ====================================================================

  Usage:

    {{ [1,1,1970] | govukDate }}

  = 1 January 1970

*/

filters.govukDate = (date, format) => {
  let d

  if (Array.isArray(date)) {
    d = filters.arrayToGovukDate(date, format)
  } else {
    d = filters.dateToGovukDate(date, format)
  }

  return d
}

/*
  ====================================================================
  arrayToGovukDate
  --------------------------------------------------------------------
  Convert array to govuk date
  Useful for converting the arrays provided by the govukDate input
  pattern to a real date. Primarly an internal function to be used by
  the govukDate filter.
  ====================================================================

  Usage:

  {{ [1, 2, 2020] | arrayToGovukDate }}

  = 1 February 2020

*/

filters.arrayToGovukDate = (array, format) => {
  const dateObject = filters.arrayToDateObject(array)
  const govukDate = filters.dateToGovukDate(dateObject, format)
  return govukDate
}

/*
  ====================================================================
  dateToGovukDate
  --------------------------------------------------------------------
  Convert js date object to govuk date (1 February 2020)
  Internal function to be used by govukDate filter
  ====================================================================

  Usage:

  {{ date | dateToGovukDate }}

  = 1 February 2020

*/

filters.dateToGovukDate = (date, format = false) => {
  if (date) {
    const theDate = DateTime.fromISO(date)
    if (theDate.isValid) {
      return theDate.toFormat('d MMMM yyyy')
    }
  }
  return ''
}

filters.dateToGovukShortDate = (date) => {
  if (date) {
    const theDate = DateTime.fromISO(date)
    if (theDate.isValid) {
      return theDate.toFormat('d MMM yyyy')
    }
  }
  return ''
}

/*
  ====================================================================
  arrayToDateObject
  --------------------------------------------------------------------
  Convert array to javascript date object
  ====================================================================

  Usage:

  {{ [1,2,2020] | arrayToDateObject }}

  = 2020-02-01T00:00:00.000Z

*/

filters.arrayToDateObject = (array) => {
  return new Date(array[2], array[1] - 1, array[0])
}

/*
  ====================================================================
  today
  --------------------------------------------------------------------
  Today's date as javascript date object
  ====================================================================

  Usage:

    {{ "" | today }}

  = 2020-02-01T00:00:00.000Z

*/

filters.today = () => {
  return DateTime.now().toFormat('yyyy-LL-dd')
}

// -------------------------------------------------------------------
// keep the following line to return your filters to the app
// -------------------------------------------------------------------
exports.filters = filters

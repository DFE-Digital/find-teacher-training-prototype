const express = require('express')
const router = express.Router()

// Route index page
router.post('/start/location', function (req, res) {
  if (req.session.data.location === 'School, university or other training provider') {
    res.render('start/location', { error: 'Searching by training provider isn’t available in this prototype.' })
    return
  }

  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/start/subjects')
})

router.get('/results/filters/location', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to search results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('start/location', { backLink: backLink, filtering: true })
})

router.post('/results/filters/location', function (req, res) {
  const isMap = req.body.map
  const backLink = { text: 'Back to search results', href: isMap ? '/results?map=yes' : '/results' }
  handleLocationSearch(req.body['postcode-town-or-city'], req, res, isMap ? '/results?map=yes' : '/results', { backLink: backLink, filtering: true })
})

function handleLocationSearch (location, req, res, successRedirect, options = {}) {
  if (location) {
    geo.find(location + ', UK', function (error, geoResponse) {
      if (error) {
        console.error(error)
        options.error = error
        res.render('start/location', options)
      } else if (geoResponse.length === 0) {
        options.error = 'Sorry, we couldn’t find that location'
        res.render('start/location', options)
      } else {
        req.session.data.latLong = geoResponse[0].location
        req.session.data.formattedAddress = geoResponse[0].formatted_address
        res.redirect(successRedirect)
      }
    })
  } else {
    res.redirect(successRedirect)
  }
}

router.get('/results/filters/subjects', function (req, res) {
  const backLink = { text: 'Back to search results', href: '/results' }
  res.render('start/subjects', { subjectGroups: subjectGroups(req), filtering: true, backLink: backLink })
})

router.get('/results/filters/salary', function (req, res) {
  const backLink = { text: 'Back to search results', href: '/results' }
  res.render('results/filters/salary', { backLink: backLink })
})

router.get('/results/filters/qualification', function (req, res) {
  const backLink = { text: 'Back to search results', href: '/results' }
  res.render('results/filters/qualification', { backLink: backLink })
})

router.get('/results/filters/study-type', function (req, res) {
  const { options } = req.session.data
  const backLink = { text: 'Back to search results', href: '/results' }
  const items = options.studyType.map(option => {
    return {
      value: option.value,
      text: option.text,
      label: {
        classes: 'govuk-label--s'
      },
      hint: {
        text: option.hint
      }
    }
  })
  res.render('results/filters/study-type', { backLink, items })
})

router.get('/start/subjects', function (req, res) {
  res.render('start/subjects', { subjectGroups: subjectGroups(req) })
})

function subjectGroups (req) {
  const subjectGroups = []

  for (const subjectGroup of Object.keys(req.session.data.groupedSubjects)) {
    const subjects = []
    const scholarshipAndBursarySubjects = [
      'Chemistry',
      'Geography',
      'Physics',
      'Computing',
      'French',
      'Spanish',
      'German'
    ]

    const lowerBursarySubjects = [
      'Biology',
      'Classics'
    ]

    const humanitiesBursarySubjects = [
      'History',
      'Music',
      'Religious education'
    ]

    req.session.data.groupedSubjects[subjectGroup].forEach(function (subject) {
      let hint
      if (scholarshipAndBursarySubjects.includes(subject)) {
        hint = 'Scholarships and bursaries up to £28,000 available.'
      } else if (subject === 'English') {
        hint = 'Bursaries of £15,000 available.'
      } else if (lowerBursarySubjects.includes(subject)) {
        hint = 'Bursaries of £26,000 available.'
      } else if (humanitiesBursarySubjects.includes(subject)) {
        hint = 'Bursaries of up to £9,000 available.'
      } else if (subject.includes('Design and technology')) {
        hint = 'Bursaries of up to £12,000 available.'
      } else if (subject.includes('Mathematics')) {
        hint = 'Scholarships and bursaries up to £22,000 available with further early career payments up to £10,000.'
      }

      // TODO: Primary maths too (6,000)
      subjects.push({
        value: subject,
        text: subject,
        label: {
          classes: 'govuk-label--s'
        },
        hint: {
          text: hint
        }
      })
    })

    subjectGroups.push({ group: subjectGroup, subjects: subjects })
  }

  return subjectGroups
}

require('./routes/results')(router)
require('./routes/course')(router)
require('./routes/locations')(router)

module.exports = router

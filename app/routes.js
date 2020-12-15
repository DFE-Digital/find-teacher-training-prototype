const express = require('express')
const router = express.Router()
const geolib = require('geolib')
const geocoder = require('google-geocoder')
const got = require('got')
const geo = geocoder({ key: process.env.GOOGLE_API_KEY })
const qs = require('qs')

const endpoint = process.env.TEACHER_TRAINING_API_URL
const recruitmentCycle = process.env.RECRUITMENT_CYCLE

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

router.get('/results', async (req, res) => {
  const page = req.query.page || 1
  const studyType = req.query.studyType || false

  // if (req.session.data.selectedSubjects.some(s => s.match(/primary/i))) {
  //   phase.push('00')
  // }

  // Find by type
  const selectedStudyType = (studyType.length > 1) ? 'full_time_or_part_time' : studyType || false

  const searchParams = {
    page,
    filter: {
      has_vacancies: false,
      subjects: '00,01',
      study_type: selectedStudyType,
      qualification: 'qts'
    },
    sort: 'provider.provider_name',
    include: 'recruitment_cycle,provider'
  }

  try {
    const queryString = qs.stringify(searchParams)

    const { body } = await got(`${endpoint}/recruitment_cycles/${recruitmentCycle}/courses/?${queryString}`, {
      responseType: 'json'
    })

    const { data, included } = body

    const providers = included.filter(item => item.type === 'providers')

    const results = data.map(item => {
      const providerId = item.relationships.provider.data.id
      const provider = providers.find(provider => provider.id === providerId)

      return {
        course: item.attributes,
        provider: provider.attributes
      }
    })

    res.render('results/index', { results })
  } catch (error) {
    console.error(error)
  }

  // // Find by subject
  // let results = req.session.data.courses.filter(function (course) {
  //   return course.subjects.some(r => phase.indexOf(r) >= 0) && course.subjects.some(r => subjects.indexOf(r) >= 0)
  // })

  // // Find by salary
  // if (req.session.data.salary !== 'All courses (with or without a salary)') {
  //   results = results.filter(function (course) {
  //     return course.options.some(o => o.includes('salary'))
  //   })
  // }

  // // Find by qualification
  // if (req.session.data.qualification.length === 1) {
  //   const qualification = req.session.data.qualification.join(' ').includes('Postgraduate') ? 'PGCE with' : 'QTS'
  //   results = results.filter(function (course) {
  //     return course.options.some(o => o.startsWith(qualification))
  //   })
  // }

  // if (req.session.data.location === 'Across England') {
  //   results.sort(function (c1, c2) {
  //     return c1.provider.toLowerCase().localeCompare(c2.provider.toLowerCase())
  //   })
  // } else {
  //   // Sort by location
  //   const savedLatLong = req.session.data.latLong || { latitude: 51.508530, longitude: -0.076132 }

  //   results.forEach(function (course) {
  //     const latLong = { latitude: course.providerAddress.latitude, longitude: course.providerAddress.longitude }
  //     const d = geolib.getDistance(savedLatLong, latLong)
  //     course.distance = ((d / 1000) * 0.621371).toFixed(0)
  //   })

  //   results.sort(function (c1, c2) {
  //     return c1.distance - c2.distance
  //   })
  // }

  // results = results.filter(course => course.distance < 50)

  // const originalCount = results.length

  // const addresses = []
  // results.forEach((result) => {
  //   result.addresses.forEach((addr) => {
  //     const a = JSON.parse(JSON.stringify(addr))
  //     if (a) {
  //       a.course = result
  //       addresses.push(a)
  //     }
  //   })
  // })

  // const groupedByTrainingProvider = groupBy(results, course => course.provider)

  // res.render('results/index', {
  //   results,
  //   groupedByTrainingProvider: [...groupedByTrainingProvider],
  //   paginated: paginated,
  //   addresses: addresses,
  //   count: originalCount
  // })
})

function groupBy (list, keyGetter) {
  const map = new Map()
  list.forEach((item) => {
    const key = keyGetter(item)
    const collection = map.get(key)
    if (!collection) {
      map.set(key, [item])
    } else {
      collection.push(item)
    }
  })
  return map
}

require('./routes/course')(router)
require('./routes/locations')(router)

module.exports = router

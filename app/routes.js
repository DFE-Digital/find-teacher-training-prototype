const express = require('express')
const router = express.Router()
const geolib = require('geolib')
const geocoder = require('google-geocoder')
const geo = geocoder({ key: process.env.GOOGLE_API_KEY })
const fs = require('fs')

// geo.find('223 Edenbridge Dr, Toronto', function(err, res){
//   console.log(err);
//   console.log(res[0].location);
// });

// Route index page
router.all('/', function (req, res) {
  res.redirect('/start/location')
})

router.all('/history', function (req, res) {
  res.redirect('https://bat-design-history.herokuapp.com/find-teacher-training')
})

router.all('/history/:path', function (req, res) {
  res.redirect(`https://bat-design-history.herokuapp.com/find-teacher-training/${req.params.path}`)
})

router.post('/start/location', function (req, res) {
  if (req.session.data.location === 'School, university or other training provider') {
    res.render('start/location', { error: 'Searching by training provider isn’t available in this prototype.' })
    return
  }

  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/start/subjects')
})

router.get('/results/filters/location', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('start/location', { backLink: backLink, filtering: true, isMap: isMap })
})

router.post('/results/filters/location', function (req, res) {
  const isMap = req.body.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  handleLocationSearch(req.body['postcode-town-or-city'], req, res, isMap ? '/results?map=yes' : '/results', { backLink: backLink, filtering: true, isMap: isMap })
})

function handleLocationSearch (location, req, res, successRedirect, options = {}) {
  if (location) {
    geo.find(location + ', UK', function (err, geoResponse) {
      if (err) {
        console.log(err)
        options.error = err
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

// Route index page
router.get('/course/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode

  getFullCourse(req, providerCode, courseCode, function (course) {
    res.render('course', { course: course })
  })
})

router.get('/apply/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const data = req.session.data

  data[`${providerCode}-${courseCode}`] = req.path
  data['seen-apply-with-choice'] = true

  const course = getCourse(req, providerCode, courseCode)
  res.render('apply', { course: course })
})

router.post('/apply/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const applyChoice = req.body['who-apply']

  if (applyChoice === 'Apply through UCAS') {
    res.redirect('https://2019.teachertraining.apply.ucas.com/apply/student/login.do')
  }

  res.redirect(`/apply/${providerCode}/${courseCode}/start`)
})

router.get('/apply-v2/:providerCode/:courseCode/start-dfe', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const course = getCourse(req, providerCode, courseCode)

  res.render('apply-v2/start-dfe', { course: course })
})

router.get('/apply-v2/:providerCode/:courseCode/start-ucas', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const course = getCourse(req, providerCode, courseCode)

  res.render('apply-v2/start-ucas', { course: course })
})

router.get('/apply-v2/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const data = req.session.data

  data[`${providerCode}-${courseCode}`] = req.path
  data['seen-apply-with-choice'] = true

  const course = getCourse(req, providerCode, courseCode)
  res.render('apply-v2', { course: course })
})

router.post('/apply-v2/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const applyChoice = req.body['who-apply']

  if (applyChoice === 'I want to apply for several courses' || applyChoice === 'I have already started my UCAS application this year') {
    res.redirect(`/apply-v2/${providerCode}/${courseCode}/start-ucas`)
  }

  res.redirect(`/apply-v2/${providerCode}/${courseCode}/start-dfe`)
})

router.post('/apply', function (req, res) {

})

router.get('/apply/:providerCode/:courseCode/:view', function (req, res) {
  const course = getCourse(req, req.params.providerCode, req.params.courseCode)
  res.render(`apply/${req.params.view}`, { course: course })
})

router.get('/apply-ucas/:providerCode/:courseCode', function (req, res) {
  const providerCode = req.params.providerCode
  const courseCode = req.params.courseCode
  const data = req.session.data

  data[`${providerCode}-${courseCode}`] = req.path
  data['seen-apply-without-choice'] = true

  const course = getCourse(req, providerCode, courseCode)
  res.render('apply-ucas', { course: course })
})

router.get('/results/filters/subjects', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('start/subjects', { subjectGroups: subjectGroups(req), filtering: true, backLink: backLink, isMap: isMap })
})

router.get('/static/subjects', function (req, res) {
  res.render('static/subjects', { subjectGroups: subjectGroups(req), filtering: true })
})

router.get('/results/filters/salary', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('results/filters/salary', { backLink: backLink, isMap: isMap })
})

router.get('/results/filters/qualification', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('results/filters/qualification', { backLink: backLink, isMap: isMap })
})

router.get('/results/filters/studytype', function (req, res) {
  const isMap = req.query.map
  const backLink = { text: 'Back to results', href: isMap ? '/results?map=yes' : '/results' }
  res.render('results/filters/studytype', { backLink: backLink, isMap: isMap })
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

    const skeSubjects = [
      'Mathematics',
      'Physics',
      'Languages',
      'French',
      'Spanish',
      'German',
      'Chemistry',
      'Computer studies',
      'Biology',
      'Geography',
      'English',
      'English language',
      'English literature',
      'Design and technology'
    ]

    req.session.data.groupedSubjects[subjectGroup].forEach(function (subject) {
      let text = ''
      if (scholarshipAndBursarySubjects.includes(subject)) {
        text = 'Scholarships and bursaries up to £28,000 available.'
      } else if (subject === 'English') {
        text = 'Bursaries of £15,000 available.'
      } else if (lowerBursarySubjects.includes(subject)) {
        text = 'Bursaries of £26,000 available.'
      } else if (humanitiesBursarySubjects.includes(subject)) {
        text = 'Bursaries of up to £9,000 available.'
      } else if (subject.includes('Design and technology')) {
        text = 'Bursaries of up to £12,000 available.'
      } else if (subject.includes('Mathematics')) {
        text = 'Scholarships and bursaries up to £22,000 available with further early career payments up to £10,000.'
      }

      if (skeSubjects.includes(subject) || subject.includes('Design and technology')) {
        if (text) {
          text = text + '<br />'
        }
        text = text + "<a href='https://getintoteaching.education.gov.uk/explore-my-options/teacher-training-routes/subject-knowledge-enhancement-ske-courses'>Subject knowledge enhancement (SKE) courses</a> available."
      }
      // TODO: Primary maths too (6,000)
      subjects.push({ name: subject, text: text ? '<span style="display: inline-block; margin-top: 5px; margin-bottom: -10px">' + text + '</span>' : null })
    })

    subjectGroups.push({ group: subjectGroup, subjects: subjects })
  }

  return subjectGroups
}

// Route index page
router.get('/results', function (req, res) {
  let paginated = false
  const phase = ['Secondary']
  const subjects = req.session.data.selectedSubjects
  const map = req.query.map

  if (req.session.data.selectedSubjects.some(s => s.match(/primary/i))) {
    phase.push('Primary')
  }

  // Find by subject
  let results = req.session.data.courses.filter(function (course) {
    return course.subjects.some(r => phase.indexOf(r) >= 0) && course.subjects.some(r => subjects.indexOf(r) >= 0)
  })

  // Find by type
  if (req.session.data['study-type'].length === 1) {
    const type = req.session.data['study-type'].join(' ').includes('Part') ? 'part time' : 'full time'

    results = results.filter(function (course) {
      return course.options.some(o => o.includes(type))
    })
  }

  // Find by salary
  if (req.session.data.salary !== 'All courses (with or without a salary)') {
    results = results.filter(function (course) {
      return course.options.some(o => o.includes('salary'))
    })
  }

  // Find by qualification
  if (req.session.data.qualification.length === 1) {
    const qualification = req.session.data.qualification.join(' ').includes('Postgraduate') ? 'PGCE with' : 'QTS'
    results = results.filter(function (course) {
      return course.options.some(o => o.startsWith(qualification))
    })
  }

  if (req.session.data.location === 'Across England') {
    results.sort(function (c1, c2) {
      return c1.provider.toLowerCase().localeCompare(c2.provider.toLowerCase())
    })
  } else {
    // Sort by location
    const savedLatLong = req.session.data.latLong || { latitude: 51.508530, longitude: -0.076132 }

    results.forEach(function (course) {
      const latLong = { latitude: course.providerAddress.latitude, longitude: course.providerAddress.longitude }
      const d = geolib.getDistanceSimple(savedLatLong, latLong)
      course.distance = ((d / 1000) * 0.621371).toFixed(0)
    })

    results.sort(function (c1, c2) {
      return c1.distance - c2.distance
    })
  }

  results = results.filter(course => course.distance < 50)

  const originalCount = results.length

  const perPage = 20

  if (!map) {
    if (results.length > perPage) {
      results.length = perPage
      paginated = true
    }
  }

  const addresses = []
  results.forEach((result) => {
    result.addresses.forEach((addr) => {
      const a = JSON.parse(JSON.stringify(addr))
      if (a) {
        a.course = result
        addresses.push(a)
      }
    })
  })

  const groupedByTrainingProvider = groupBy(results, course => course.provider)

  res.render(map ? 'map' : 'results/index', {
    results: results,
    groupedByTrainingProvider: [...groupedByTrainingProvider],
    paginated: paginated,
    addresses: addresses,
    count: originalCount
  })
})

router.get('/results/filters/funding', function (req, res) {
  const backLink = { text: 'Back to results', href: '/results' }
  res.render('start/funding', { backLink: backLink, filtering: true })
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

function getCourse (req, providerCode, courseCode) {
  const data = req.session.data

  return data.courses.find(function (c) {
    return c.providerCode === providerCode && c.programmeCode === courseCode
  })
}

function getFullCourse (req, providerCode, courseCode, callback) {
  let course
  const data = req.session.data

  if (data[`${providerCode}-${courseCode}-course`]) {
    callback(data[`${providerCode}-${courseCode}-course`])
    return
  }

  fs.readFile(`lib/courses/course_${providerCode}_${courseCode}.json`, (err, file) => {
    if (err) throw err
    course = JSON.parse(file)
    data[`${providerCode}-${courseCode}-course`] = course
    callback(course)
  })
}

// Add your routes here - above the module.exports line

module.exports = router

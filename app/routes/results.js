const got = require('got')
const qs = require('qs')
const geolib = require('geolib')
const geocoder = require('google-geocoder')

const endpoint = process.env.TEACHER_TRAINING_API_URL
const cycle = process.env.RECRUITMENT_CYCLE
const geo = geocoder({ key: process.env.GOOGLE_API_KEY })

const groupBy = (list, keyGetter) => {
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

module.exports = router => {
  router.get('/results', async (req, res) => {
    const page = req.query.page || 1
    const selectedStudyTypes = req.query.studyType || req.session.data.selectedStudyTypes
    req.session.data.selectedStudyTypes = selectedStudyTypes

    // if (req.session.data.selectedSubjects.some(s => s.match(/primary/i))) {
    //   phase.push('00')
    // }

    const searchParams = {
      page,
      per_page: 20,
      filter: {
        has_vacancies: true,
        subjects: '00',
        study_type: selectedStudyTypes.toString(),
        qualification: 'qts'
      },
      sort: 'provider.provider_name',
      include: 'recruitment_cycle,provider'
    }

    try {
      const queryString = qs.stringify(searchParams)

      const { data, included } = await got(`${endpoint}/recruitment_cycles/${cycle}/courses/?${queryString}`).json()

      let results = data

      if (results.length > 0) {
        const providers = included.filter(item => item.type === 'providers')

        results = data.map(item => {
          const providerId = item.relationships.provider.data.id
          const provider = providers.find(provider => provider.id === providerId)

          return {
            course: item.attributes,
            provider: provider.attributes
          }
        })
      }

      res.render('results', {
        results,
        selectedStudyTypes
      })
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
}

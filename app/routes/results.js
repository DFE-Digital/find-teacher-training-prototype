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

    // Quaification
    const selectedQualificationOption = req.query.qualification || req.session.data.selectedQualificationOption
    req.session.data.selectedQualificationOption = selectedQualificationOption

    // Salary
    const selectedSalaryOption = req.query.salary || req.session.data.selectedSalaryOption
    req.session.data.selectedSalaryOption = selectedSalaryOption

    // Send
    const selectedSendOption = (req.query.send === 'include') || (req.session.data.selectedSendOption === 'include')
    req.session.data.selectedSendOption = selectedSendOption

    // Subject
    // Start page ‘Education phase’ options send a string which needs converting to an array
    const subjectQuery = Array.isArray(req.query.subject) ? req.query.subject : req.query.subject.toString().split(',')
    let selectedSubjectOption = subjectQuery || req.session.data.selectedSubjectOption
    selectedSubjectOption = typeof selectedSubjectOption === 'string' ? Array(selectedSubjectOption) : selectedSubjectOption
    req.session.data.selectedSubjectOption = selectedSubjectOption

    // Study type
    const selectedStudyTypeOption = req.query.studyType || req.session.data.selectedStudyTypeOption
    req.session.data.selectedStudyTypeOption = selectedStudyTypeOption

    // Vacancies
    const selectedVacancyOption = req.query.vacancy || req.session.data.selectedVacancyOption
    req.session.data.selectedVacancyOption = selectedVacancyOption

    const searchParams = {
      page,
      per_page: 20,
      filter: {
        funding_type: selectedSalaryOption,
        has_vacancies: selectedVacancyOption,
        subjects: selectedSubjectOption.toString(),
        study_type: selectedStudyTypeOption.toString(),
        qualification: selectedQualificationOption.toString(),
        send_courses: selectedSendOption
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

      // Show selected subjects in filter sidebar
      // Takes an array of subject codes and maps it to subject data
      let selectedSubjects = false
      if (selectedSubjectOption) {
        selectedSubjects = selectedSubjectOption.map(option => {
          const { subjectOptions } = req.session.data
          const subject = subjectOptions.find(subject => subject.value === option)

          return subject
        })
      }

      res.render('results', {
        results,
        resultsCount: results.length,
        selectedQualificationOption,
        selectedSalaryOption,
        selectedSendOption,
        selectedSubjects,
        selectedStudyTypeOption,
        selectedVacancyOption
      })
    } catch (error) {
      console.error(error)
    }

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

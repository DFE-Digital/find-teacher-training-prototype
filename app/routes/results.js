const got = require('got')
const qs = require('qs')
const NodeGeocoder = require('node-geocoder')

const endpoint = process.env.TEACHER_TRAINING_API_URL
const cycle = process.env.RECRUITMENT_CYCLE
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

const geoCoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_GEOCODING_API_KEY
})

module.exports = router => {
  router.get('/results', async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = 20
    const radius = 10

    // Location
    let selectedLocation = req.query.location || req.session.data.selectedLocation
    const geoCodedLocation = await geoCoder.geocode(`${selectedLocation}, UK'`)
    selectedLocation = geoCodedLocation[0]
    const { formattedAddress } = selectedLocation
    req.session.data.selectedLocation = selectedLocation

    console.log('selectedLocation', selectedLocation)

    const areaName = selectedLocation.administrativeLevels.level2long

    // Qualification
    const selectedQualificationOption = req.query.qualification || req.session.data.selectedQualificationOption
    req.session.data.selectedQualificationOption = selectedQualificationOption

    // Salary
    const selectedSalaryOption = req.query.salary || req.session.data.selectedSalaryOption
    req.session.data.selectedSalaryOption = selectedSalaryOption

    // Send
    const selectedSendOption = (req.query.send === 'include') || (req.session.data.selectedSendOption === 'include')
    req.session.data.selectedSendOption = selectedSendOption

    // Subject
    const { subjectOptions } = req.session.data

    let selectedSubjectOption = []
    if (req.query.level) {
      // Filter by education level
      // One (string) or many (Array) can be selected – we need an Array
      const selectedLevelOption = (typeof req.query.level === 'string') ? Array(req.query.level) : req.query.level

      // Map selected levels to array of subjects in that level
      selectedLevelOption.forEach(level => {
        selectedSubjectOption.push(subjectOptions.filter(option => option.type.includes(level)).map(item => item.value))
      })

      selectedSubjectOption = selectedSubjectOption.flat()
    } else if (req.query.subject) {
      // Filter by subject
      selectedSubjectOption = req.query.subject || req.session.data.selectedSubjectOption

      selectedSubjectOption = (typeof req.query.subject === 'string') ? Array(req.query.subject) : req.query.subject
    }

    req.session.data.selectedSubjectOption = selectedSubjectOption

    // Study type
    const selectedStudyTypeOption = req.query.studyType || req.session.data.selectedStudyTypeOption
    req.session.data.selectedStudyTypeOption = selectedStudyTypeOption

    // Vacancies
    const selectedVacancyOption = req.query.vacancy || req.session.data.selectedVacancyOption
    req.session.data.selectedVacancyOption = selectedVacancyOption

    const searchParams = page => {
      const query = {
        page,
        per_page: perPage,
        filter: {
          funding_type: selectedSalaryOption,
          has_vacancies: selectedVacancyOption,
          subjects: selectedSubjectOption.toString(),
          study_type: selectedStudyTypeOption.toString(),
          qualification: selectedQualificationOption.toString(),
          send_courses: selectedSendOption,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude,
          radius
        },
        sort: 'provider.provider_name',
        include: 'recruitment_cycle,provider'
      }

      return qs.stringify(query)
    }

    try {
      const { data, included } = await got(`${endpoint}/recruitment_cycles/${cycle}/courses/?${searchParams(page)}`).json()

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
          const subject = subjectOptions.find(subject => subject.value === option)

          return subject
        })
      }

      // Pagination
      // TODO: Get pagination data from API response
      // https://github.com/DFE-Digital/teacher-training-api/pull/1690
      const resultsCount = 300
      const pageCount = resultsCount / perPage
      const prevPage = page < pageCount ? (page - 1) : false
      const nextPage = page > 0 ? (page + 1) : false

      const pagination = {
        pages: pageCount,
        next: nextPage
          ? {
              href: `?${searchParams(nextPage)}`,
              page: nextPage,
              text: 'Next page'
            }
          : false,
        previous: prevPage
          ? {
              href: `?${searchParams(prevPage)}`,
              page: prevPage,
              text: 'Previous page'
            }
          : false
      }

      res.render('results', {
        areaName,
        googleMapsApiKey,
        formattedAddress,
        latLong: [selectedLocation.latitude, selectedLocation.longitude],
        pagination,
        radius,
        results,
        resultsCount,
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

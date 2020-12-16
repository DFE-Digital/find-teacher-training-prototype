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

const toArray = item => {
  return (typeof item === 'string') ? Array(item) : item
}

module.exports = router => {
  router.get('/results', async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = 20
    const radius = 10
    const { defaults } = req.session.data

    // Location
    let selectedLocation = req.query.location || req.session.data.selectedLocation
    const geoCodedLocation = await geoCoder.geocode(`${selectedLocation}, UK'`)
    selectedLocation = geoCodedLocation[0]
    const { formattedAddress } = selectedLocation
    req.session.data.selectedLocation = selectedLocation

    const areaName = selectedLocation.administrativeLevels.level2long

    // Qualification
    const qualification = toArray(req.session.data.qualification || req.query.qualification || defaults.qualification)
    req.session.data.qualification = qualification

    // Salary
    const salary = req.session.data.salary || req.query.salary || defaults.salary
    req.session.data.salary = salary

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
    const studyType = toArray(req.session.data.studyType || req.query.studyType || defaults.studyType)
    req.session.data.studyType = studyType

    // Vacancies
    const vacancy = req.query.vacancy || req.session.data.vacancy || defaults.vacancy
    req.session.data.vacancy = vacancy

    const searchParams = page => {
      const query = {
        page,
        per_page: perPage,
        filter: {
          funding_type: salary,
          has_vacancies: vacancy,
          subjects: selectedSubjectOption.toString(),
          study_type: studyType.toString(),
          qualification: qualification.toString(),
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

      let courses = data

      if (courses.length > 0) {
        const providers = included.filter(include => include.type === 'providers')

        courses = data.map(course => {
          const providerId = course.relationships.provider.data.id
          const provider = providers.find(provider => provider.id === providerId)

          return {
            course: course.attributes,
            provider: provider.attributes
          }
        })
      }

      const getProviderGeo = async result => {
        const { provider } = result
        const { latitude, longitude } = provider
        const geocodedLocation = await geoCoder.reverse({
          lat: latitude,
          lon: longitude
        })

        const geo = geocodedLocation[0]

        // Replace location data retrived from API with geocoded data
        provider.city = geo.city
        provider.area = geo.administrativeLevels.level2long

        return {
          course: result.course,
          provider
        }
      }

      const getResults = async () => {
        return Promise.all(courses.map(result => getProviderGeo(result)))
      }

      const results = await getResults()

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
        qualification,
        salary,
        selectedSendOption,
        selectedSubjects,
        studyType,
        vacancy
      })
    } catch (error) {
      console.error(error)
    }
  })
}

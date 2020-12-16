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
  router.post('/results', async (req, res) => {
    const { location } = req.session.data

    // Convert free text location to lat/lon
    const geoCodedLocation = await geoCoder.geocode(`${location}, UK`)
    const geo = geoCodedLocation[0]

    req.session.data.lat = geo.latitude
    req.session.data.lng = geo.longitude

    res.redirect('/results')
  })

  router.get('/results', async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = 20
    const radius = 10
    const { defaults, subjectOptions } = req.session.data

    // Location
    const lat = req.session.data.lat || req.query.lat || defaults.lat
    const lon = req.session.data.lon || req.query.lon || defaults.lon
    req.session.data.lat = lat
    req.session.data.lon = lon

    const geoCodedLocation = await geoCoder.reverse({ lat, lon })
    const geo = geoCodedLocation[0]
    const areaName = geo.administrativeLevels.level2long || geo.city

    // Qualification
    const qualification = toArray(req.session.data.qualification || req.query.qualification || defaults.qualification)
    req.session.data.qualification = qualification

    // Salary
    const salary = req.session.data.salary || req.query.salary || defaults.salary
    req.session.data.salary = salary

    // Send
    const send = (req.session.data.send === 'include') || (req.query.send === 'include') || (defaults.send === 'include')
    req.session.data.send = send

    // Subject
    let subjects = []
    if (req.query.level) {
      // Filter by education level
      // One (string) or many (Array) can be selected – we need an Array
      const selectedLevelOption = toArray(req.query.level)

      // Map selected levels to array of subjects in that level
      selectedLevelOption.forEach(level => {
        subjects.push(subjectOptions.filter(option => option.type.includes(level)).map(item => item.value))
      })

      subjects = subjects.flat()
    } else if (req.query.subjects) {
      // Filter by subject
      subjects = toArray(req.session.data.subjects || req.query.subjects)
    }

    req.session.data.subjects = subjects

    // Study type
    const studyType = toArray(req.session.data.studyType || req.query.studyType || defaults.studyType)
    req.session.data.studyType = studyType

    // Vacancies
    const vacancy = req.query.vacancy || req.session.data.vacancy || defaults.vacancy
    req.session.data.vacancy = vacancy

    const apiQuery = {
      page,
      per_page: perPage,
      filter: {
        funding_type: salary,
        latitude: lat,
        longitude: lon,
        has_vacancies: vacancy,
        qualification: qualification.toString(),
        radius,
        send_courses: send,
        study_type: studyType.toString(),
        subjects: subjects.toString(),
      },
      sort: 'provider.provider_name',
      include: 'recruitment_cycle,provider'
    }

    try {
      const queryString = qs.stringify(apiQuery)
      const { data, included } = await got(`${endpoint}/recruitment_cycles/${cycle}/courses/?${queryString}`).json()

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
      if (subjects) {
        selectedSubjects = subjects.map(option => {
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

      const searchQuery = page => {
        const query = {
          lat,
          lon,
          page,
          salary,
          send,
          studyType,
          subjects,
          vacancy
        }

        return qs.stringify(query)
      }

      const pagination = {
        pages: pageCount,
        next: nextPage
          ? {
              href: `?${searchQuery(nextPage)}`,
              page: nextPage,
              text: 'Next page'
            }
          : false,
        previous: prevPage
          ? {
              href: `?${searchQuery(prevPage)}`,
              page: prevPage,
              text: 'Previous page'
            }
          : false
      }

      res.render('results', {
        areaName,
        googleMapsApiKey,
        latLong: [lat, lon],
        pagination,
        radius,
        results,
        resultsCount,
        qualification,
        salary,
        send,
        selectedSubjects,
        studyType,
        vacancy
      })
    } catch (error) {
      console.error(error)
    }
  })
}

const qs = require('qs')

const teacherTrainingModel = require('../models/teacher-training')
const locationModel = require('../models/location')
const utils = require('../utils')()

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

module.exports = router => {
  router.post('/results', async (req, res) => {
    // Convert free text location to latitude/lon
    const { location } = req.session.data
    const { latitude, longitude } = await utils.geocode(location)

    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    res.redirect('/results')
  })

  router.get('/results', async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = 20
    const radius = 10
    const { defaults, subjectOptions } = req.session.data

    // Location
    const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
    const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude
    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    // Location meta
    const location = await locationModel.getPoint(latitude, longitude)
    location.query = req.session.data.location

    // Qualification
    const qualification = utils.toArray(req.session.data.qualification || req.query.qualification || defaults.qualification)
    const qualificationItems = utils.qualificationItems(qualification).map(item => {
      item.hint = false
      item.label.classes = false
      return item
    })
    req.session.data.qualification = qualification

    // Salary
    const salary = req.session.data.salary || req.query.salary || defaults.salary
    const salaryItems = utils.salaryItems(salary)
    req.session.data.salary = salary

    // Send
    const send = (req.session.data.send === 'include') || (req.query.send === 'include') || (defaults.send === 'include')
    req.session.data.send = send

    // Subject
    const subjects = utils.toArray(req.session.data.subjects || req.query.subjects || defaults.subjects)
    const subjectItems = utils.subjectGroupItems(subjects, {
      send,
      showHintText: false
    })
    req.session.data.subjects = subjects

    // Study type
    const studyType = utils.toArray(req.session.data.studyType || req.query.studyType || defaults.studyType)
    const studyTypeItems = utils.studyTypeItems(studyType, {
      showHintText: false
    })
    req.session.data.studyType = studyType

    // Vacancies
    const vacancy = req.query.vacancy || req.session.data.vacancy || defaults.vacancy
    const vacancyItems = utils.vacancyItems(vacancy)
    req.session.data.vacancy = vacancy

    try {
      const CourseListResponse = await teacherTrainingModel.getCourses(page, perPage, {
        funding_type: salary,
        latitude,
        longitude,
        has_vacancies: vacancy,
        qualification: qualification.toString(),
        radius,
        send_courses: send,
        study_type: studyType.toString(),
        subjects: subjects.toString()
      })
      const { data, links, included } = CourseListResponse

      let courses = data
      if (courses.length > 0) {
        const providers = included.filter(include => include.type === 'providers')

        // Only show running and findable courses
        // https://github.com/DFE-Digital/teacher-training-api/issues/1694
        courses = courses.filter(course => course.attributes.running && course.attributes.findable)

        courses = courses.map(course => {
          const providerId = course.relationships.provider.data.id
          const provider = providers.find(provider => provider.id === providerId)

          if (course.relationships.accredited_body.data) {
            const accreditedBodyId = course.relationships.accredited_body.data.id
            const accreditedBody = providers.find(provider => provider.id === accreditedBodyId)
            course.attributes.accredited_body = accreditedBody.attributes.name
          }

          return {
            course: course.attributes,
            provider: provider.attributes
          }
        })
      }

      const getProviderGeo = async result => {
        const { provider } = result
        const { latitude, longitude } = provider
        const geo = await utils.reverseGeocode(latitude, longitude)

        // Replace location data retrived from API with geocoded data
        provider.area = geo.city
        provider.address = `${provider.name}, ${geo.streetName}, ${geo.city}`

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
      // Maps array of subject codes to subject data
      const selectedSubjects = subjects.map(option => subjectOptions.find(subject => subject.value === option))

      // Pagination
      const pageCount = links.last.match(/page=(\d*)/)[1]
      // TODO: Get true results count from API response
      const resultsCount = perPage * pageCount
      const prevPage = links.prev ? (page - 1) : false
      const nextPage = links.next ? (page + 1) : false

      const searchQuery = page => {
        const query = {
          latitude,
          longitude,
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
        googleMapsApiKey,
        latLong: [latitude, longitude],
        location,
        pagination,
        radius,
        results,
        resultsCount,
        qualification,
        qualificationItems,
        salary,
        salaryItems,
        send,
        selectedSubjects,
        studyType,
        studyTypeItems,
        subjectItems,
        vacancy,
        vacancyItems
      })
    } catch (error) {
      if (error.response) {
        const { body } = error.response
        res.status(body.errors[0].status)
        res.render('error', {
          title: body.errors[0].title,
          content: body.errors[0].detail
        })
      } else {
        console.error(error)
      }
    }
  })
}

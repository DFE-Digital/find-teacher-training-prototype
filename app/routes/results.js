const qs = require('qs')

const teacherTrainingModel = require('../models/teacher-training')
const locationModel = require('../models/location')
const utils = require('../utils')()

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

module.exports = router => {
  router.post('/results', async (req, res) => {
    // Convert free text location to latitude/longitude
    const { latitude, longitude } = await utils.geocode(req.session.data.location)
    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    // Get area name from latitude/longitude
    const area = await locationModel.getPoint(latitude, longitude)
    req.session.data.londonBorough = area.codes['local-authority-eng']

    // Redirect to London search filter if in London TTW area
    res.redirect(area.type === 'LBO' ? '/results/filters/london' : '/results')
  })

  router.get('/results', async (req, res) => {
    const page = Number(req.query.page) || 1
    const perPage = 20
    const radius = 10
    const { defaults, subjectOptions } = req.session.data
    const { providerCode } = req.query || req.session.data

    // Location
    const location = req.session.data.location
    const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
    const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude
    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    // Area metadata
    const area = await locationModel.getPoint(latitude, longitude)

    // London boroughs
    const londonBorough = utils.toArray(req.session.data.londonBorough || req.query.londonBorough || defaults.londonBorough)
    const londonBoroughItems = utils.londonBoroughItems(londonBorough).filter(item => item.checked === true)
    req.session.data.londonBorough = londonBorough

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
    const send = (req.session.data.send && req.session.data.send[0] === 'include') || (req.query.send && req.query.send[0] === 'include') || (defaults.send[0] === 'include')
    const sendItems = utils.sendItems(send)
    req.session.data.send = send

    // Subject
    const subjects = utils.toArray(req.session.data.subjects || req.query.subjects || defaults.subjects)
    const subjectItems = utils.subjectItems(subjects, {
      showHintText: false,
      checkAll: providerCode && subjects.length === 0
    })
    req.session.data.subjects = subjects
    // req.session.data.checkAllSubjects = providerCode && subjects.length === 0

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

    // API query params
    const filter = {
      funding_type: salary,
      latitude,
      longitude,
      has_vacancies: vacancy,
      qualification: qualification.toString(),
      radius,
      send_courses: send,
      study_type: studyType.toString(),
      subjects: subjects.toString()
    }

    try {
      let CourseListResponse
      if (providerCode) {
        CourseListResponse = await teacherTrainingModel.getProviderCourses(page, perPage, filter, providerCode)
      } else {
        CourseListResponse = await teacherTrainingModel.getCourses(page, perPage, filter)
      }
      const { data, links, included } = CourseListResponse

      let courses = data
      if (courses.length > 0) {
        const providers = included.filter(include => include.type === 'providers')

        // Only show running and findable courses
        // https://github.com/DFE-Digital/teacher-training-api/issues/1694
        courses = courses.filter(courseResource => courseResource.attributes.running && courseResource.attributes.findable)

        courses = courses.map(async courseResource => {
          const course = courseResource.attributes
          const courseRalationships = courseResource.relationships

          // Get course provider
          const providerId = courseRalationships.provider.data.id
          const providerResource = providers.find(providerResource => providerResource.id === providerId)
          const provider = providerResource.attributes

          // Get course accredited body
          if (courseRalationships.accredited_body.data) {
            const accreditedBodyId = courseRalationships.accredited_body.data.id
            const accreditedBody = providers.find(providerResource => providerResource.id === accreditedBodyId)
            course.accredited_body = accreditedBody.attributes.name
          }

          // Get travel areas that school placements lie within
          const placementAreas = await utils.getPlacementAreas(provider.code, course.code)

          return {
            course,
            provider,
            placementAreas
          }
        })
      }

      const getResults = async () => {
        const results = await Promise.all(courses)
        const selectedTravelAreas = [area.name]
        const selectedLondonBoroughs = londonBoroughItems.map(item => item.text)
        const selectedAreas = selectedTravelAreas.concat(selectedLondonBoroughs)

        return results.filter(result => result.placementAreas.some(location => selectedAreas.includes(location)))
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

      let provider
      if (providerCode) {
        provider = {
          code: providerCode,
          name: results[0].provider.name
        }
      }

      res.render('results', {
        area,
        googleMapsApiKey,
        latLong: [latitude, longitude],
        location,
        londonBoroughItems,
        pagination,
        radius,
        results,
        resultsCount,
        provider,
        qualification,
        qualificationItems,
        salary,
        salaryItems,
        send,
        sendItems,
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

const qs = require('qs')

const teacherTrainingModel = require('../models/teacher-training')
const utils = require('../utils')()

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY

module.exports = router => {
  router.post('/results', async (req, res) => {
    await utils.processQuery(req.session.data.q, req.session.data)
    res.redirect(req.session.data.londonBorough ? '/results/filters/london' : '/results')
  })

  router.get('/results', async (req, res) => {
    const { area, defaults, provider, subjectOptions } = req.session.data

    // Pagination
    const page = Number(req.query.page) || 1
    const perPage = 20

    // Search radius
    const radius = req.session.data.radius

    // Search query
    const q = req.session.data.q || req.query.q

    // Location
    const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
    const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude

    // London boroughs
    const londonBorough = utils.toArray(req.session.data.londonBorough || req.query.londonBorough || defaults.londonBorough)
    const londonBoroughItems = utils.londonBoroughItems(londonBorough).filter(item => item.checked === true)
    // req.session.data.londonBorough = londonBorough

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
      checkAll: provider && subjects.length === 0
    })
    req.session.data.subjects = subjects
    req.session.data.checkAllSubjects = provider && subjects.length === 0

    // Study type
    const studyType = utils.toArray(req.session.data.studyType || req.query.studyType || defaults.studyType)
    const studyTypeItems = utils.studyTypeItems(studyType, {
      showHintText: false
    })
    req.session.data.studyType = studyType

    // Vacancies
    const vacancy = (req.session.data.vacancy && req.session.data.vacancy[0] === 'include') || (req.query.vacancy && req.query.vacancy[0] === 'include') || (defaults.vacancy[0] === 'include')
    const vacancyItems = utils.vacancyItems(vacancy)
    req.session.data.vacancy = vacancy

    // API query params
    const filter = {
      findable: true,
      funding_type: salary,
      has_vacancies: vacancy,
      qualification: qualification.toString(),
      send_courses: send,
      study_type: studyType.toString(),
      subjects: subjects.toString()
    }

    try {
      let CourseListResponse
      if (provider) {
        CourseListResponse = await teacherTrainingModel.getProviderCourses(page, perPage, filter, provider.code)
      } else {
        if (radius) {
          filter.latitude = latitude
          filter.longitude = longitude
          filter.radius = radius
        }
        CourseListResponse = await teacherTrainingModel.getCourses(page, perPage, filter)
      }
      const { data, links, meta, included } = CourseListResponse

      let courses = data
      if (courses.length > 0) {
        const providers = included.filter(include => include.type === 'providers')

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
        return results

        // DISABLED: Filter results by those with placements in selected search area
        // const results = await Promise.all(courses)
        // const selectedTravelAreas = [area.name]
        // const selectedLondonBoroughs = londonBoroughItems.map(item => item.text)
        // const selectedAreas = selectedTravelAreas.concat(selectedLondonBoroughs)
        // return results.filter(result => result.placementAreas.some(location => selectedAreas.includes(location)))
      }

      const results = await getResults()

      // Show selected subjects in filter sidebar
      // Maps array of subject codes to subject data
      const selectedSubjects = subjects.map(option => subjectOptions.find(subject => subject.value === option))

      // Pagination
      const pageCount = links.last.match(/page=(\d*)/)[1]
      const resultsCount = meta.count
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
        area,
        googleMapsApiKey,
        latLong: [latitude, longitude],
        londonBorough,
        londonBoroughItems,
        pagination,
        provider,
        q,
        qualification,
        qualificationItems,
        radius,
        results,
        resultsCount,
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
      res.render('error', {
        title: error.name,
        content: error
      })
    }
  })
}

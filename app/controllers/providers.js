const qs = require('qs')
const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

exports.show = async (req, res) => {
  const ProviderSingleResponse = await teacherTrainingService.getProvider(req.params.providerCode)

  const page = 1
  const perPage = 100

  const filter = {
    findable: true,
    funding_type: req.session.data.defaults.fundingType.toString(),
    qualification: req.session.data.defaults.qualification.toString(),
    study_type: req.session.data.defaults.studyMode.toString()
  }

  const sortBy = 'name'

  const CourseListResponse = await teacherTrainingService.getProviderCourses(page, perPage, filter, sortBy, req.params.providerCode)

  const { data, links, meta, included } = CourseListResponse

  let courses = data
  if (courses.length > 0) {
    const providers = included.filter(include => include.type === 'providers')

    courses = courses.map(async courseResource => {
      const course = utils.decorateCourse(courseResource.attributes)
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

      // Get locations
      const LocationListResponse = await teacherTrainingService.getCourseLocations(provider.code, course.code)
      const statuses = LocationListResponse.included.filter(item => item.type === 'location_statuses')
      const locations = LocationListResponse.data.map(location => {
        const { attributes } = location

        // Vacancy status
        const statusId = location.relationships.location_status.data.id
        const status = statuses.find(status => status.id === statusId)
        attributes.has_vacancies = status.attributes.has_vacancies

        // Address
        const streetAddress1 = attributes.street_address_1 ? attributes.street_address_1 + ', ' : ''
        const streetAddress2 = attributes.street_address_2 ? attributes.street_address_2 + ', ' : ''
        const city = attributes.city ? attributes.city + ', ' : ''
        const county = attributes.county ? attributes.county + ', ' : ''
        const postcode = attributes.postcode

        attributes.name = attributes.name.replace(/'/g, '’')
        attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

        return attributes
      })

      // Sort locations by disance
      locations.sort((a, b) => {
        return a.distance - b.distance
      })

      // Set course visa sponsorship based on provider
      course.visaSponsorship = {}
      course.visaSponsorship.canSponsorSkilledWorkerVisa = course.can_sponsor_skilled_worker_visa
      course.visaSponsorship.canSponsorStudentVisa = course.can_sponsor_student_visa

      const schools = locations.filter(location => location.code !== '-')

      course.trainingLocation = locations.find(location => location.code === '-')

      return {
        course,
        provider,
        schools
      }
    })
  }

  // Data
  const provider = ProviderSingleResponse
  const results = await Promise.all(courses)

  results.sort((a,b) => {
    return a.course.name.localeCompare(b.course.name)
  })

  const searchQuery = () => {
    const query = {
      latitude: req.session.data.latitude,
      longitude: req.session.data.longitude,
      page: req.session.data.page,
      filter: {
        send: req.session.data.filter.send,
        vacancy: req.session.data.filter.vacancy,
        studyMode: req.session.data.filter.studyMode,
        qualification: req.session.data.filter.qualification,
        degreeGrade: req.session.data.filter.degreeGrade,
        visaSponsorship: req.session.data.filter.visaSponsorship,
        fundingType: req.session.data.filter.fundingType,
        subject: req.session.data.filter.subject,
        campaign: req.session.data.filter.campaign
      }
    }

    return qs.stringify(query)
  }

  res.render('./provider/index', {
    provider,
    results,
    actions: {
      back: `/results?${searchQuery()}`
    }
  })
}

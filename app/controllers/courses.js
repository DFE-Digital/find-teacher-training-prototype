const qs = require('qs')
const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

exports.show = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    const LocationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
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

    // Mock course visa sponsorship
    // course.canSponsorVisa = (Math.random(course.code) > 0.5)

    // Mock placement schools
    // Assume placement schools are locations with a campus code that isn’t '-'
    const schools = locations.filter(location => location.code !== '-')

    // Mock school placement policy
    // Assume provider has chosen to show placement schools if a course has more than 1 school location
    // course.placementPolicy = schools.length > 1 ? 'hosted' : 'placed'

    // Mock centre-based training location
    // Assume centre-based training location is location with campus code '-'
    // const mainTrainingLocation = locations.find(location => location.code === '-')
    // const trainingLocationOptions = ['remote', 'school', mainTrainingLocation]

    // course.trainingLocation = trainingLocationOptions[Math.floor(Math.random() * trainingLocationOptions.length)]

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

    res.render('course/index', {
      course,
      schools,
      actions: {
        back: `/results?${searchQuery()}`
      }
    })
  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}

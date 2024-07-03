const qs = require('qs')
const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()
const helper = require('../helpers/utils')

exports.show = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    if (course.accredited_body_code) {
      const providerSingleResponse = await teacherTrainingService.getProvider(course.accredited_body_code)
      course.accredited_body = utils.decorateProvider(providerSingleResponse)
    }

    const locationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
    const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
    const locations = locationListResponse.data.map(location => {
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

    // Mock study sites
    const studySites = []

    if (course.accredited_body) {
      const ap = course.accredited_body

      const site = {}
      site.name = ap.name
      site.address = ''

      const location = {}
      location.streetAddress1 = ap.street_address_1
      location.streetAddress2 = ap.street_address_2
      location.city = ap.city
      location.county = ap.county
      location.postcode = ap.postcode

      site.address = helper.arrayToList(
        array = Object.values(location),
        join = ', ',
        final = ', '
      )

      studySites.push(site)
    }

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
        filter: req.session.data.filter
      }

      return qs.stringify(query)
    }

    let back = `/${req.params.version}/results?${searchQuery()}`
    if (req.query.referrer) {
      back = `/${req.params.version}/providers/${req.params.providerCode}`
    }

    req.session.data.courseDistances.sort((a, b) => {
      return a.distance - b.distance
    })

    const distance = req.session.data.courseDistances.find(course => course.code === courseCode)

    res.render(`course/${req.params.version}/index`, {
      course,
      schools,
      studySites,
      distance,
      actions: {
        back,
        view: `/${req.params.version}/providers/${req.params.providerCode}/courses/${req.params.courseCode}`
      }
    })
  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}

exports.showAccreditedProvider = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    if (course.accredited_body_code) {
      const providerSingleResponse = await teacherTrainingService.getProvider(course.accredited_body_code)
      course.accredited_body = utils.decorateProvider(providerSingleResponse)
    }

    const locationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
    const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
    const locations = locationListResponse.data.map(location => {
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

      //attributes.name = attributes.name.replace(/'/g, ''')
      //attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

      return attributes
    })

    res.render(`course/${req.params.version}/about-accredited`, {
      course,
      actions: {
        back: `/${req.params.version}/providers/${req.params.providerCode}/courses/${req.params.courseCode}`
      }
    })

  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}


exports.showTrainingWithDisabilities = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    if (course.accredited_body_code) {
      const providerSingleResponse = await teacherTrainingService.getProvider(course.accredited_body_code)
      course.accredited_body = utils.decorateProvider(providerSingleResponse)
    }

    const locationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
    const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
    const locations = locationListResponse.data.map(location => {
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

      //attributes.name = attributes.name.replace(/'/g, ''')
      //attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

      return attributes
    })

    res.render(`course/${req.params.version}/training-with-disabilities`, {
      course,
      actions: {
        back: `/${req.params.version}/providers/${req.params.providerCode}/courses/${req.params.courseCode}`
      }
    })

  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}


exports.showProvider = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    if (course.accredited_body_code) {
      const providerSingleResponse = await teacherTrainingService.getProvider(course.accredited_body_code)
      course.accredited_body = utils.decorateProvider(providerSingleResponse)
    }

    const locationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
    const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
    const locations = locationListResponse.data.map(location => {
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

      //attributes.name = attributes.name.replace(/'/g, ''')
      //attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

      return attributes
    })

    res.render(`course/${req.params.version}/about-provider`, {
      course,
      actions: {
        back: `/${req.params.version}/providers/${req.params.providerCode}/courses/${req.params.courseCode}`
      }
    })

  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}

exports.showSchoolPlacements = async (req, res) => {
  const providerCode = req.params.providerCode.toUpperCase()
  const courseCode = req.params.courseCode.toUpperCase()

  try {
    const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
    const course = utils.decorateCourse(courseSingleResponse.data.attributes)

    if (course.accredited_body_code) {
      const providerSingleResponse = await teacherTrainingService.getProvider(course.accredited_body_code)
      course.accredited_body = utils.decorateProvider(providerSingleResponse)
    }

    const locationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)
    const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
    const locations = locationListResponse.data.map(location => {
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

      //attributes.name = attributes.name.replace(/'/g, ''')

      //This will format address to be one line, but you can comment it out//
      attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

      return attributes
    })
    const schools = locations.filter(location => location.code !== '-')
    const distance = req.session.data.courseDistances.find(course => course.code === courseCode)

    res.render(`course/${req.params.version}/school-placements`, {
      course,
      schools,
      distance,
      actions: {
        back: `/${req.params.version}/providers/${req.params.providerCode}/courses/${req.params.courseCode}`
      }
    })

  } catch (error) {
    res.render('error', {
      title: error.name,
      content: error.message
    })
  }
}

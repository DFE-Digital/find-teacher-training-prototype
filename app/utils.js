const NodeGeocoder = require('node-geocoder')
const data = require('./data/session-data-defaults')
const filters = require('./filters')()
const locationService = require('../app/services/location')
const teacherTrainingService = require('../app/services/teacher-training')

if (!process.env.HERE_GEOCODING_API_KEY) {
  throw Error("Missing HERE_GEOCODING_API_KEY – add it to your .env file")
}

const geocoder = NodeGeocoder({
  provider: 'here',
  apiKey: process.env.HERE_GEOCODING_API_KEY,
  country: 'United Kingdom'
})

module.exports = () => {
  const utils = {}

  utils.decorateCourse = course => {
    // Length
    switch (course.course_length) {
      case 'OneYear':
        course.length = '1 year'
        break
      case 'TwoYears':
        course.length = 'Up to 2 years'
        break
      default:
        course.length = course.course_length
    }

    // Study mode
    switch (course.study_mode) {
      case 'full_time':
        course.study_mode = 'Full time'
        break
      case 'part_time':
        course.study_mode = 'Part time'
        break
      default:
        course.study_mode = 'Full time or part time'
    }

    // Qualification
    if (course.qualifications.length === 2 && course.qualifications.includes('pgce')) {
      course.qualification = 'PGCE with QTS'
    } else if (course.qualifications.length === 2 && course.qualifications.includes('pgde')) {
      course.qualification = 'PGDE with QTS'
    } else {
      course.qualification = course.qualifications[0].toUpperCase()
    }

    // Funding
    course.has_fees = course.funding_type === 'fee'
    course.salaried = course.funding_type === 'salary' || course.funding_type === 'apprenticeship'
    course.funding_option = course.salaried ? 'Salary' : 'Student finance if you’re eligible'
    course.has_bursary = course.name.includes('Chemistry') // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L47
    course.has_scholarship = true // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L59
    course.bursary_only = course.has_bursary && !course.has_scholarship
    course.has_scholarship_and_bursary = course.has_bursary && course.has_scholarship

    // Year range
    course.year_range = `${data.cycle} to ${Number(data.cycle) + 1}`

    return course
  }

  utils.geocode = async string => {
    try {
      const geoCodedLocation = await geocoder.geocode(string)
      const geo = geoCodedLocation[0]

      return {
        latitude: geo.latitude,
        longitude: geo.longitude
      }
    } catch (error) {
      return false
    }
  }

  utils.processQuery = async (query, sessionData) => {
    if (query === 'England') {
      sessionData.radius = false
      sessionData.latitude = false
      sessionData.longitude = false

      return 'england'
    }

    const location = await utils.geocode(query)
    if (location) {
      // Get latitude/longitude
      const { latitude, longitude } = location
      sessionData.radius = 10
      sessionData.latitude = latitude
      sessionData.longitude = longitude

      // Get area name from latitude/longitude
      const area = await locationService.getPoint(latitude, longitude)
      sessionData.area = area
      sessionData.londonBorough = area.type === 'LBO' ? area.codes['local-authority-eng'] : false

      return 'area'
    } else {
      const providers = await teacherTrainingService.getProviderSuggestions(query)
      if (providers && providers.data && providers.data[0]) {
        sessionData.provider = providers.data[0].attributes
        return 'provider'
      }
    }
  }

  utils.reverseGeocode = async (lat, lon) => {
    try {
      const geoCodedLocation = await geocoder.reverse({ lat, lon })
      return geoCodedLocation[0]
    } catch (error) {
      console.error('Reverse geocoding error', error)
    }
  }

  utils.toArray = item => {
    return (typeof item === 'string') ? Array(item) : item
  }

  utils.londonBoroughItems = (londonBorough, options = {}) => {
    let { londonBoroughOptions } = data

    if (options.regionFilter) {
      londonBoroughOptions = londonBoroughOptions.filter(borough => borough.region === options.regionFilter)
    }

    return londonBoroughOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: londonBorough ? londonBorough.includes(option.value) && options.checked !== false : false
    }))
  }

  utils.qualificationItems = (qualification, options = {}) => {
    return data.qualificationOptions.map(option => ({
      value: option.value,
      text: option.text,
      label: { classes: 'govuk-label--s' },
      hint: { text: options.showHintText ? filters.markdown(option.hint) : false },
      checked: qualification ? qualification.includes(option.value) : false
    }))
  }

  utils.salaryItems = salary => {
    return data.salaryOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: salary === true
    }))
  }

  utils.studyTypeItems = (studyType, options = {}) => {
    return data.studyTypeOptions.map(option => ({
      value: option.value,
      text: option.text,
      hint: { text: options.showHintText ? option.hint : false },
      checked: studyType ? studyType.includes(option.value) : false
    }))
  }

  utils.sendItems = send => {
    return data.sendOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: send === true
    }))
  }

  utils.subjectGroupItems = (subjects = [], options = {}) => {
    return data.subjectOptions.filter(option => option.type === options.type).map(option => ({
      value: option.value,
      id: `subject-${option.value}`,
      text: option.text,
      hint: { text: options.showHintText ? option.hint : false },
      checked: subjects.includes(option.value) || options.checkAll === true
    }))
  }

  utils.subjectItems = (subjects = [], options = {}) => {
    return data.subjectGroups.map(group => ({
      text: group.text,
      name: 'subjects',
      items: utils.subjectGroupItems(subjects, {
        type: group.value,
        showHintText: options.showHintText
      })
    }))
  }

  utils.vacancyItems = vacancy => {
    return data.vacancyOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: vacancy === true
    }))
  }

  utils.getPlacementAreas = async (providerCode, courseCode, fakedPlacementArea) => {
    const LocationListResponse = await teacherTrainingService.getCourseLocations(providerCode, courseCode)

    // Get catchment areas that locations lie within
    const areas = fakedPlacementArea ? new Array(fakedPlacementArea) : []
    if (LocationListResponse.data) {
      for await (const locationResource of LocationListResponse.data) {
        const { latitude, longitude } = locationResource.attributes
        const point = await locationService.getPoint(latitude, longitude)
        if (point) {
          areas.push(point.name)
        }
      }
    }

    // Remove duplicate catchment areas
    let locations = await Promise.all(areas)
    locations = areas.map(area => area.replace(/\s(City|Borough)\sCouncil|Corporation/, '')).sort()
    locations = [...new Set(locations)]

    return locations
  }

  return utils
}

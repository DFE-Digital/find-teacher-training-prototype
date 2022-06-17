const NodeGeocoder = require('node-geocoder')
const data = require('./data/session-data-defaults')
const filters = require('./filters')()
const teacherTrainingService = require('../app/services/teacher-training')

if (!process.env.GCP_API_KEY) {
  throw Error('Missing GCP_API_KEY – add it to your .env file')
}

const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GCP_API_KEY,
  country: 'United Kingdom'
})

function getRandomInt (max) {
  return Math.floor(Math.random() * max)
}

module.exports = () => {
  const utils = {}

  utils.decorateCourse = course => {
    // SKE
    const subjectCodesWithSke = data.subjectOptions
      .filter(subject => subject.hasSke === true)
      .map(subject => subject.value)

    course.has_ske = subjectCodesWithSke.some(code => course.subject_codes.includes(code))

    // There's a bug in the API where has_bursary and has_scholarship not always
    // returned. Check for this and set value
    if (course.has_bursary === undefined) {
      if (course.bursary_amount === 'null') {
        course.has_bursary = false
      } else {
        course.has_bursary = true
      }
    }

    if (course.has_scholarship === undefined) {
      if (course.scholarship_amount === 'null') {
        course.has_scholarship = false
      } else {
        course.has_scholarship = true
      }
    }

    course.has_fees = course.funding_type === 'fee'
    course.has_salary = course.funding_type === 'salary' || course.funding_type === 'apprenticeship'
    course.bursary_only = course.has_bursary && !course.has_scholarship
    course.has_scholarship_and_bursary = course.has_bursary && course.has_scholarship

    if (course.has_salary) {
      course.funding_option = 'Salary'
    } else if (course.has_scholarship_and_bursary) {
      course.funding_option = 'Scholarships or bursaries, as well as student finance, are available if you’re eligible'
    } else if (course.has_bursary) {
      course.funding_option = 'Bursaries and student finance are available if you’re eligible'
    } else {
      course.funding_option = 'Student finance if you’re eligible'
    }

    // Year range
    course.year_range = `${data.cycle} to ${Number(data.cycle) + 1}`

    return course
  }

  utils.geocode = async string => {
    try {
      const geoCodedLocation = await geocoder.geocode(`${string}, UK`)
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

    if (query === 'location') {
      const location = await utils.geocode(sessionData.locationName)
      if (location) {
        // Get latitude/longitude
        const { latitude, longitude } = location
        sessionData.radius = 50
        sessionData.latitude = latitude
        sessionData.longitude = longitude

        return 'area'
      }
    }

    if (query === 'provider') {
      const providers = await teacherTrainingService.getProviderSuggestions(sessionData.providerName)
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

  utils.qualificationItems = (qualification, options = {}) => {
    return data.qualificationOptions.map(option => ({
      value: option.value,
      text: option.text,
      label: { classes: 'govuk-label--s' },
      hint: { text: options.showHintText ? filters.markdown(option.hint) : false },
      checked: qualification ? qualification.includes(option.value) : false
    }))
  }

  utils.degreeGradeItems = (degreeGrade, options = {}) => {
    return data.degreeGradeOptions.map(option => ({
      value: option.value,
      text: option.text,
      label: { classes: 'govuk-label--s' },
      hint: { text: options.showHintText ? filters.markdown(option.hint) : false },
      checked: degreeGrade ? degreeGrade.includes(option.value) : false
    }))
  }

  utils.fundingTypeItems = (fundingType) => {
    return data.fundingTypeOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: fundingType === true
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

  utils.sendItems = (send) => {
    return data.sendOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: send === true
    }))
  }

  utils.vacancyItems = (vacancy) => {
    return data.vacancyOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: vacancy === true
    }))
  }

  utils.visaSponsorshipItems = (visaSponsorship) => {
    return data.visaSponsorshipOptions.map(option => ({
      value: option.value,
      text: option.text,
      checked: visaSponsorship === true
    }))
  }

  return utils
}

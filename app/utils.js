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
    // Placeholder until API is updated
    course.requirements = {
      degree: {
      },
      gcses: {
        english: {},
        maths: {},
        science: {}
      }
    }

    // Adding random degree class requirement
    switch (getRandomInt(5)) {
      case 0:
        course.requirements.degree.minimumClass = '21'
        break
      case 1:
        course.requirements.degree.minimumClass = '22'
        break
      case 2:
        course.requirements.degree.minimumClass = 'third'
        break
      default:
        course.requirements.degree.minimumClass = 'degree'
        break
    }

    // Adding degree subject requirement unless it’s primary
    if (course.name !== 'Primary') {
      course.requirements.degree.subject = '50% of your degree modules should be in the subject.'
    }

    // Randomising whether pending GCSEs are accepted or not.
    switch (getRandomInt(2)) {
      case 0:
        course.requirements.gcses.pendingGcsesAccepted = true
        break
      default:
        course.requirements.gcses.pendingGcsesAccepted = false
        break
    }

    // Randomising whether equivalency tests accepted or not.
    switch (getRandomInt(2)) {
      case 0:
        course.requirements.gcses.equivalencyTestsAccepted = true
        break
      default:
        course.requirements.gcses.equivalencyTestsAccepted = false
        break
    }

    if (course.requirements.gcses.equivalencyTestsAccepted) {
      // Randomising which subjects tests accepted for
      switch (getRandomInt(5)) {
        case 0:
          course.requirements.gcses.equivalencyTestSubjects = ['maths']
          break
        case 1:
          course.requirements.gcses.equivalencyTestSubjects = ['English']
          break
        case 2:
          course.requirements.gcses.equivalencyTestSubjects = ['English', 'maths']
          break
        default:
          if (course.name === 'Primary') {
            course.requirements.gcses.equivalencyTestSubjects = ['English', 'maths', 'science']
          } else {
            course.requirements.gcses.equivalencyTestSubjects = ['English', 'maths']
          }
          break
      }
    }

    switch (getRandomInt(5)) {
      case 0:
        course.requirements.gcses.maths.flexibility = 'must'
        course.requirements.gcses.english.flexibility = 'must'
        if (course.name === 'Primary') {
          course.requirements.gcses.science.flexibility = 'must'
        }
        break
      case 1:
        course.requirements.gcses.maths.flexibility = 'pending'
        course.requirements.gcses.english.flexibility = 'pending'
        if (course.name === 'Primary') {
          course.requirements.gcses.science.flexibility = 'pending'
        }
        break
      default:
        course.requirements.gcses.maths.flexibility = 'equivalency-test-offered'
        course.requirements.gcses.english.flexibility = 'equivalency-test-offered'
        if (course.name === 'Primary') {
          course.requirements.gcses.science.flexibility = 'equivalency-test-offered'
        }
        break
    }

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

    // SKE
    const subjectCodesWithSke = data.subjectOptions
      .filter(subject => subject.hasSke === true)
      .map(subject => subject.value)

    course.has_ske = subjectCodesWithSke.some(code => course.subject_codes.includes(code))

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

  utils.entryRequirementItems = (entryRequirement, options = {}) => {
    return data.entryRequirementOptions.map(option => ({
      value: option.value,
      text: option.text,
      label: { classes: 'govuk-label--s' },
      hint: { text: options.showHintText ? filters.markdown(option.hint) : false },
      checked: entryRequirement ? entryRequirement.includes(option.value) : false
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

const NodeGeocoder = require('node-geocoder')
const data = require('./data/session-data-defaults')
const filters = require('./filters')()
const locationService = require('../app/services/location')
const teacherTrainingService = require('../app/services/teacher-training')

const geocoder = NodeGeocoder({
  provider: 'here',
  apiKey: process.env.HERE_GEOCODING_API_KEY,
  country: 'United Kingdom'
})

module.exports = () => {
  const utils = {}

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
      if (providers) {
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

  utils.subjectItems = (subjects = [], options = {}) => {
    return data.subjectGroups.map(group => ({
      text: group.text,
      name: 'subjects',
      items: data.subjectOptions.filter(option => option.type === group.value).map(option => ({
        value: option.value,
        id: `subject-${option.value}`,
        text: option.text,
        hint: { text: options.showHintText ? option.hint : false },
        checked: subjects.includes(option.value) || options.checkAll === true
      }))
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

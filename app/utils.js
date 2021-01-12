const NodeGeocoder = require('node-geocoder')
const data = require('./data/session-data-defaults')
const filters = require('./filters')()

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
      console.error('Geocoding error', error)
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
      checked: londonBorough ? londonBorough.includes(option.value) : false
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
      checked: salary === option.value
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
      name: 'send',
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
      checked: vacancy === option.value
    }))
  }

  return utils
}

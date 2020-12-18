const got = require('got')
const NodeGeocoder = require('node-geocoder')
const data = require('./data/session-data-defaults')
const filters = require('./filters')()

const geocoder = NodeGeocoder({
  provider: 'here',
  apiKey: process.env.HERE_GEOCODING_API_KEY,
  country: 'United Kingdom',
  state: 'England'
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

  utils.mapit = async (lat, lon, type = 'TTW') => {
    try {
      const data = await got(`https://mapit.mysociety.org/point/4326/${lon},${lat}?api_key=${process.env.MAPIT_API_KEY}&type=${type}`).json()

      const area = data[Object.keys(data)[0]]

      return area
    } catch (error) {
      console.error('MapIt error', error)
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

  utils.qualificationItems = qualification => {
    return data.qualificationOptions.map(option => ({
      value: option.value,
      text: option.text,
      label: { classes: 'govuk-label--s' },
      hint: { text: filters.markdown(option.hint) },
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

  utils.studyTypeItems = studyType => {
    return data.studyTypeOptions.map(option => ({
      value: option.value,
      text: option.text,
      hint: { text: option.hint },
      checked: studyType ? studyType.includes(option.value) : false
    }))
  }

  utils.subjectGroupItems = (send, subjects = []) => {
    return data.subjectGroups.map(group => ({
      text: group.text,
      items: data.subjectOptions.filter(option => option.type === group.value).map(option => ({
        value: option.value,
        id: option.name ? `subject-${option.name}` : `subject-${option.value}`,
        name: option.name || 'subjects',
        text: option.text,
        hint: { text: option.hint },
        checked: option.name === 'send' ? (send === true) : subjects.includes(option.value)
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

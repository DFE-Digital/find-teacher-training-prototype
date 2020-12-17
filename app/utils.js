const got = require('got')
const NodeGeocoder = require('node-geocoder')

const geocoder = NodeGeocoder({
  provider: 'here',
  apiKey: process.env.HERE_GEOCODING_API_KEY,
  country: 'United Kingdom',
  state: 'England'
})

module.exports = () => {
  const utils = {}

  utils.getSubjectGroups = (levels, send, subjectOptions = []) => {
    return levels.map(level => ({
      text: level.text,
      items: subjectOptions.filter(subject => subject.type === level.value).map(option => ({
        value: option.value,
        id: option.name ? `subject-${option.name}` : `subject-${option.value}`,
        name: option.name || 'subjects',
        text: option.text,
        hint: { text: option.hint },
        checked: option.name === 'send' ? (send === true) : subjectOptions.includes(option.value)
      }))
    }))
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

  return utils
}

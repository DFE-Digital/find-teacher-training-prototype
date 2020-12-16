const NodeGeocoder = require('node-geocoder')

const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.GOOGLE_GEOCODING_API_KEY
})

module.exports = () => {
  const utils = {}

  utils.getSubjectGroups = (levels, send, subjectOptions = []) => {
    return levels.map(level => ({
      text: level.text,
      items: subjectOptions.filter(subject => subject.type === level.value).map(option => ({
        value: option.value,
        id: option.name ? `subject-${option.name}` : `subject-${option.value}`,
        name: option.name || 'subject',
        text: option.text,
        hint: { text: option.hint },
        checked: option.name === 'send' ? (send === true) : subjectOptions.includes(option.value)
      }))
    }))
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

  return utils
}

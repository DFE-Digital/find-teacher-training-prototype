const got = require('got')

const gcpApiKey = process.env.GCP_API_KEY

const locationSuggestions = {
  async getSuggestions (i) {

    const locationsResponse = await got(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${i}&language=en&components=country:uk&key=${gcpApiKey}`).json()

    if (locationsResponse.predictions) {
      return locationsResponse.predictions.map(function(p) {
        return p.description.split(',').slice(0,-1).join(',')
      })
    } else {
      return []
    }

  }
}

module.exports = locationSuggestions

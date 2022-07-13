const got = require('got')

const gcpApiKey = process.env.GCP_API_KEY

const locationSuggestionsService = {
  async getLocationSuggestions (query) {
    // https://developers.google.com/maps/documentation/places/web-service/autocomplete
    const locationSuggestionsListResponse = await got(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&language=en&components=country:uk&key=${gcpApiKey}`).json()

    console.log(locationSuggestionsListResponse);

    if (locationSuggestionsListResponse.predictions) {
      return locationSuggestionsListResponse.predictions.map((prediction) => {
        return prediction.description.split(',').slice(0, -1).join(',')
      })
    } else {
      return []
    }
  },

  async getLocation (query) {
    query = 'ChIJEzx-nws4dkgR0SwUBZVCKFc'
    const locationSingleResponse = await got(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${query}&language=en&components=country:uk&key=${gcpApiKey}`).json()

    console.log(locationSingleResponse);

    if (locationSingleResponse.predictions) {

    } else {
      return {}
    }
  }
}

module.exports = locationSuggestionsService

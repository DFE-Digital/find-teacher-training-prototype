const express = require('express')
const router = express.Router()

// Route index page
router.post('/start/location', function (req, res) {
  if (req.session.data.location === 'School, university or other training provider') {
    res.render('start/location', { error: 'Searching by training provider isn’t available in this prototype.' })
    return
  }

  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/start/subjects')
})

router.get('/results/filters/location', function (req, res) {
  const backLink = { text: 'Back to search results', href: '/results' }
  res.render('start/location', { backLink: backLink, filtering: true })
})

router.post('/results/filters/location', function (req, res) {
  const backLink = { text: 'Back to search results', href: '/results' }
  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/results', { backLink: backLink, filtering: true })
})

function handleLocationSearch (location, req, res, successRedirect, options = {}) {
  if (location) {
    geo.find(location + ', UK', function (error, geoResponse) {
      if (error) {
        console.error(error)
        options.error = error
        res.render('start/location', options)
      } else if (geoResponse.length === 0) {
        options.error = 'Sorry, we couldn’t find that location'
        res.render('start/location', options)
      } else {
        req.session.data.latLong = geoResponse[0].location
        req.session.data.formattedAddress = geoResponse[0].formatted_address
        res.redirect(successRedirect)
      }
    })
  } else {
    res.redirect(successRedirect)
  }
}

require('./routes/start')(router)
require('./routes/results')(router)
require('./routes/filters')(router)
require('./routes/course')(router)
require('./routes/locations')(router)

module.exports = router

const locationSuggestionsService = require('../services/location-suggestions')

exports.browse_get = async (req, res) => {
  if (process.env.USER_JOURNEY === 'search') {
    res.redirect('/search')
  } else {
    res.render('browse/index', {
      actions: {
        primary: '/browse/primary',
        secondary: '/browse/secondary'
      }
    })
  }
}

exports.primary_get = async (req, res) => {
  req.session.data.ageGroup = 'primary'
  res.redirect('/browse/location')
}

exports.secondary_get = async (req, res) => {
  req.session.data.ageGroup = 'secondary'
  res.render('browse/secondary-subjects', {

  })
}

exports.location_get = async (req, res) => {
  const cities = ['Birmingham','Bradford','Bristol','Leeds','Liverpool','London','Manchester','Sheffield']
  const regions = ['North East','North West','Yorkshire and The Humber','East Midlands','West Midlands','East of England','London','South East','South West']

  res.render('browse/location', {
    ageGroup: req.session.data.ageGroup,
    cities,
    regions
  })
}

exports.location_post = async (req, res) => {

}

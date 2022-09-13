const locationSuggestionsService = require('../services/location-suggestions')

const subjects = require('../data/subjects')

const cities = ['Birmingham','Bradford','Bristol','Exeter','Leeds','Lincoln','Liverpool','London','Manchester','Norwich','Nottingham','Sheffield']
const regions = ['North East','North West','Yorkshire and The Humber','East Midlands','West Midlands','East of England','London','South East','South West']

exports.browse_get = async (req, res) => {
  delete req.session.data.q
  delete req.session.data.ageGroup
  delete req.session.data.subjects
  delete req.session.data.location
  delete req.session.data.place
  delete req.session.data.latitude
  delete req.session.data.longitude

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
  req.session.data.subjects = ['00','01','02','03','04','06','07']
  res.redirect('/browse/location')
}

exports.secondary_get = async (req, res) => {
  req.session.data.ageGroup = 'secondary'
  const languageSubjects = subjects.filter(subject => subject.level === 'secondary' && subject.group === 'languages')
  const stemSubjects = subjects.filter(subject => subject.level === 'secondary' && subject.group === 'stem')
  const otherSubjects = subjects.filter(subject => subject.level === 'secondary' && subject.group === 'other')

  res.render('browse/secondary-subjects', {
    languageSubjects,
    stemSubjects,
    otherSubjects
  })
}

exports.location_get = async (req, res) => {
  req.session.data.q = 'location'

  if (req.query.location) {
    let locationSingleResponse = await locationSuggestionsService.getLocation(req.session.data.location)
    req.session.data.place = locationSingleResponse
    // add latitude and longitude to session data for radial search
    req.session.data.latitude = locationSingleResponse.geometry.location.lat
    req.session.data.longitude = locationSingleResponse.geometry.location.lng

    res.redirect('/results')
  } else {
    res.render('browse/location', {
      ageGroup: req.session.data.ageGroup,
      cities,
      regions,
      actions: {
        search: '/browse/location'
      }
    })
  }
}

exports.location_post = async (req, res) => {
  const errors = []

  if (!req.session.data.location.length) {
    const error = {}
    error.fieldName = "location"
    error.href = "#location"
    error.text = "Enter a city, town or postcode"
    errors.push(error)
  }

  if (errors.length) {
    res.render('browse/location', {
      ageGroup: req.session.data.ageGroup,
      cities,
      regions,
      actions: {
        search: '/browse/location'
      },
      errors
    })
  } else {
    let locationSingleResponse = await locationSuggestionsService.getLocation(req.session.data.location)
    req.session.data.place = locationSingleResponse
    // add latitude and longitude to session data for radial search
    req.session.data.latitude = locationSingleResponse.geometry.location.lat
    req.session.data.longitude = locationSingleResponse.geometry.location.lng

    res.redirect('/results')
  }

}

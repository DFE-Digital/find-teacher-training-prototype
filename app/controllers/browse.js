const locationSuggestionsService = require('../services/location-suggestions')

const subjects = require('../data/subjects')

const cities = ['Birmingham','Bradford','Bristol','Exeter','Leeds','Lincoln','Liverpool','London','Manchester','Norwich','Nottingham','Sheffield']
const regions = ['North East','North West','Yorkshire and The Humber','East Midlands','West Midlands','East of England','London','South East','South West']

exports.browse_get = async (req, res) => {
  delete req.session.data.route
  delete req.session.data.q
  delete req.session.data.ageGroup
  delete req.session.data.filter
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
        primaryAll: '/browse/primary-all-england',
        secondary: '/browse/secondary',
        secondaryAll: '/browse/secondary-all-england'
      }
    })
  }
}

exports.primary_get = async (req, res) => {
  req.session.data.ageGroup = 'primary'
  req.session.data.filter = {
    subject: ['00','01','02','03','04','06','07']
  }
  // req.session.data.filter.subject = ['00','01','02','03','04','06','07']
  res.redirect('/browse/location')
}

exports.secondary_get = async (req, res) => {
  req.session.data.ageGroup = 'secondary'

  const languageSubjects = subjects.filter(subject => subject.level === 'secondary' && subject.group === 'languages')
  languageSubjects.push({
    id: '4608e5e3-2a1a-48a1-8236-56c7af5a139d',
    name: 'Another modern language',
    code: '24',
    level: 'secondary'
  })

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

exports.primary_all_england_get = async (req, res) => {
  req.session.data.route = 'all'
  req.session.data.q = 'england'
  req.session.data.ageGroup = 'primary'

  req.session.data.filter = {}
  req.session.data.filter.subject = subjects
    .filter(subject => subject.level === 'primary')
    .map((s) => {
      return s.code
    })

  res.redirect('/results')
}

exports.secondary_all_england_get = async (req, res) => {
  req.session.data.route = 'all'
  req.session.data.q = 'england'
  req.session.data.ageGroup = 'secondary'

  req.session.data.filter = {}
  req.session.data.filter.subject = subjects
    .filter(subject => subject.level === 'secondary')
    .map((s) => {
      return s.code
    })

  res.redirect('/results')
}

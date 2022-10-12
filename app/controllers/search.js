const locationSuggestionsService = require('../services/location-suggestions')
const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

const utilsHelper = require('../helpers/utils')

exports.search_get = async (req, res) => {
  delete req.session.data.filter
  delete req.session.data.provider
  delete req.session.data.q
  delete req.session.data.ageGroup
  delete req.session.data.location
  delete req.session.data.place
  delete req.session.data.latitude
  delete req.session.data.longitude

  if (process.env.USER_JOURNEY === 'browse') {
    res.redirect('/browse')
  } else {
    res.render('search/index')
  }
}

exports.search_post = async (req, res) => {
  // Search query
  const q = req.session.data.q || req.query.q

  const errors = []

  if (req.session.data.q === undefined) {
    const error = {}
    error.fieldName = "q"
    error.href = "#q"
    error.text = "Select find courses by location or by training provider"
    errors.push(error)
  } else {
    if (req.session.data.q === 'location' && !req.session.data.location.length) {
      const error = {}
      error.fieldName = "location"
      error.href = "#location"
      error.text = "Enter a city, town or postcode"
      errors.push(error)
    }

    if (req.session.data.q === 'provider' && !req.session.data.provider.length) {
      const error = {}
      error.fieldName = "provider"
      error.href = "#provider"
      error.text = "Enter a provider name or code"
      errors.push(error)
    }
  }

  if (errors.length) {
    res.render('search/index', {
      errors
    })
  } else {

    if (q === 'provider') {
      let providerSuggestionListResponse = await teacherTrainingService.getProviderSuggestions(req.session.data.provider)

      // TODO: if the response contains multiple providers, redirect user to a page
      // to choose the appropriate provider before returning back to results list

      // get the first provider from the response
      req.session.data.provider = providerSuggestionListResponse?.data[0]?.attributes
    } else if (q === 'location') {
      let locationSingleResponse = await locationSuggestionsService.getLocation(req.session.data.location)
      req.session.data.place = locationSingleResponse
      // add latitude and longitude to session data for radial search
      req.session.data.latitude = locationSingleResponse.geometry.location.lat
      req.session.data.longitude = locationSingleResponse.geometry.location.lng
    }

    res.redirect('/age-groups')
  }
}

exports.age_groups_get = async (req, res) => {
  res.render('search/age-groups')
}

exports.age_groups_post = async (req, res) => {
  const ageGroup = req.session.data.ageGroup

  const errors = []

  if (!req.session.data.ageGroup?.length) {
    const error = {}
    error.fieldName = "age-groups"
    error.href = "#age-groups"
    error.text = "Select which age group you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/age-groups', {
      errors
    })
  } else {
    if (ageGroup === 'primary') {
      res.redirect('/primary-subjects')
    } else if (ageGroup === 'secondary') {
      res.redirect('/secondary-subjects')
    } else if (ageGroup === 'furtherEducation') {
      req.session.data.filter = {}
      req.session.data.filter.subject = ['41']
      res.redirect('/results')
    } else {
      res.redirect('/results')
    }
  }
}

exports.primary_subjects_get = async (req, res) => {
  let selectedSubject
  if (req.session.data.filter?.subject) {
    selectedSubject = req.session.data.filter.subject
  }

  const subjectItems = utilsHelper.getSubjectItems(selectedSubject, 'primary', false)

  res.render('search/primary-subjects', {
    subjectItems
  })
}

exports.primary_subjects_post = async (req, res) => {
  const errors = []

  if (!req.session.data.filter.subject?.length) {
    const error = {}
    error.fieldName = "subject"
    error.href = "#subject"
    error.text = "Select a least one primary subject you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    let selectedSubject
    if (req.session.data.filter?.subject) {
      selectedSubject = req.session.data.filter.subject
    }

    const subjectItems = utilsHelper.getSubjectItems(selectedSubject, 'primary', false)

    res.render('search/primary-subjects', {
      subjectItems,
      errors
    })
  } else {
    res.redirect('/results')
  }
}

exports.secondary_subjects_get = async (req, res) => {
  let selectedSubject
  if (req.session.data.filter?.subject) {
    selectedSubject = req.session.data.filter.subject
  }

  const subjectItems = utilsHelper.getSubjectItems(selectedSubject, 'secondary', true)

  res.render('search/secondary-subjects', {
    subjectItems
  })
}

exports.secondary_subjects_post = async (req, res) => {
  const errors = []

  if (!req.session.data.filter.subject?.length) {
    const error = {}
    error.fieldName = "subject"
    error.href = "#subject"
    error.text = "Select at least one secondary subjects you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    let selectedSubject
    if (req.session.data.filter?.subject) {
      selectedSubject = req.session.data.filter.subject
    }

    const subjectItems = utilsHelper.getSubjectItems(selectedSubject, 'secondary', true)

    res.render('search/secondary-subjects', {
      subjectItems,
      errors
    })
  } else {
    res.redirect('/results')
  }
}

exports.location_suggestions_json = async (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let locationSuggestionListResponse
  locationSuggestionListResponse = await locationSuggestionsService.getLocationSuggestions(req.query.query)

  res.json(locationSuggestionListResponse)
}

exports.provider_suggestions_json = async (req, res) => {
  req.headers['Access-Control-Allow-Origin'] = true

  let providerSuggestionListResponse
  providerSuggestionListResponse = await teacherTrainingService.getProviderSuggestions(req.query.query)

  let providers = providerSuggestionListResponse.data

  if (providers.length) {
    providers = providers.map(providerResource => {
      return providerResource.attributes
    })
  }

  // Results
  const results = await Promise.all(providers)

  results.sort((a, b) => {
    return a.name.localeCompare(b.name)
  })

  res.json(results)
}

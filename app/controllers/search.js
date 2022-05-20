const utils = require('../utils')()
const locationSuggestions = require('../services/location-suggestions')

exports.search = async (req, res) => {
  const query = req.session.data.q || req.query.q
  const queryType = await utils.processQuery(query, req.session.data)
  const { filtering } = req.query

  res.redirect('/age-group')
}

exports.age_group_get = async (req, res) => {
  res.render('filters/age-group')
}

exports.age_group_post = async (req, res) => {
  const ageGroupAnswer = req.body.ageGroup

  if (ageGroupAnswer === 'primary') {
    res.redirect('/primary-specialist-subject')
  } else if (ageGroupAnswer === 'secondary') {
    res.redirect('/subject')
  } else if (ageGroupAnswer === 'furtherEducation') {
    res.redirect('/results')
  } else {
    res.render('filters/age-group')
  }
}

exports.primary_get = async (req, res) => {
  res.render('filters/primary')
}

exports.primary_post = async (req, res) => {
  console.log(req.session.data)
  const primarySpecialistSubjectsAnswer = req.body.primarySpecialistSubjects

  if (primarySpecialistSubjectsAnswer === 'yes') {
    res.redirect('/primary-specialist-subject')
  } else if (primarySpecialistSubjectsAnswer === 'no') {
    // set subject to "Primary" only
    req.session.data.subjects = ['00']

    res.redirect('/results')
  } else {
    res.render('filters/primary')
  }
}

exports.primary_specialist_subject_get = async (req, res) => {
  res.render('filters/primary-specialist-subject', {
    showError: req.query.showError
  })
}

exports.subject_get = async (req, res) => {
  const q = req.session.data.q || req.query.q
  res.render('filters/subject', {
    backLink: {
      text: 'Back',
      href: '/'
    },
    q,
    sendItems: utils.sendItems(req.session.data.send)
  })
}

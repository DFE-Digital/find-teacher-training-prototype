const utils = require('../utils')()
// const locationSuggestions = require('../services/location-suggestions')

exports.search = async (req, res) => {
  // const query = req.session.data.q || req.query.q
  // const queryType = await utils.processQuery(query, req.session.data)
  // const { filtering } = req.query

  res.redirect('/age-groups')
}

exports.age_groups_get = async (req, res) => {
  res.render('filters/age-groups')
}

exports.age_groups_post = async (req, res) => {
  const ageGroupAnswer = req.body.ageGroup

  if (ageGroupAnswer === 'primary') {
    res.redirect('/primary-subjects')
  } else if (ageGroupAnswer === 'secondary') {
    res.redirect('/secondary-subjects')
  } else if (ageGroupAnswer === 'furtherEducation') {
    res.redirect('/results')
  } else {
    res.render('filters/age-groups')
  }
}

// exports.primary_get = async (req, res) => {
//   res.render('filters/primary-subjects')
// }
//
// exports.primary_post = async (req, res) => {
//   console.log(req.session.data)
//   const primarySpecialistSubjectsAnswer = req.body.primarySpecialistSubjects
//
//   if (primarySpecialistSubjectsAnswer === 'yes') {
//     res.redirect('/primary-subjects')
//   } else if (primarySpecialistSubjectsAnswer === 'no') {
//     // set subject to "Primary" only
//     req.session.data.subjects = ['00']
//
//     res.redirect('/results')
//   } else {
//     res.render('filters/primary-subjects')
//   }
// }

exports.primary_subjects_get = async (req, res) => {
  res.render('filters/primary-subjects', {
    // showError: req.query.showError
  })
}

exports.primary_subjects_post = async (req, res) => {
  const errors = []

  if (!req.session.data.subjects?.length) {
    const error = {}
    error.fieldName = "primary-subject"
    error.href = "#primary-subject"
    error.text = "Select a least one primary subject you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    res.render('filters/primary-subjects', {
      showError: (errors.length)
    })
  } else {
    res.redirect('/results')
  }
}

exports.secondary_subjects_get = async (req, res) => {
  const q = req.session.data.q || req.query.q
  res.render('filters/secondary-subjects', {
    // q,
    // sendItems: utils.sendItems(req.session.data.send)
  })
}

exports.secondary_subjects_post = async (req, res) => {
  const q = req.session.data.q || req.query.q

  const errors = []

  if (!req.session.data.subjects?.length) {
    const error = {}
    error.fieldName = "secondary-subject"
    error.href = "#secondary-subject"
    error.text = "Select at least one secondary subjects you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    res.render('filters/secondary-subjects', {
      // q,
      // sendItems: utils.sendItems(req.session.data.send),
      showError: (errors.length)
    })
  } else {
    res.redirect('/results')
  }
}

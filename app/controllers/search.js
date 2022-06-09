const utils = require('../utils')()
// const locationSuggestions = require('../services/location-suggestions')

exports.search_get = async (req, res) => {
  // const query = req.session.data.q || req.query.q
  // const queryType = await utils.processQuery(query, req.session.data)
  // const { filtering } = req.query

  res.render('search/index')
}

exports.search_post = async (req, res) => {
  const errors = []

  if (!req.session.data.subjects?.length) {
    const error = {}
    error.fieldName = "q"
    error.href = "#q"
    error.text = "Select find courses by location or by training provider"
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/index', {
      showError: (errors.length)
    })
  } else {
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
      showError: (errors.length)
    })
  } else {
    if (ageGroup === 'primary') {
      res.redirect('/primary-subjects')
    } else if (ageGroup === 'secondary') {
      res.redirect('/secondary-subjects')
    } else if (ageGroup === 'furtherEducation') {
      res.redirect('/results')
    } else {
      res.redirect('/results')
    }
  }
}

// exports.primary_get = async (req, res) => {
//   res.render('search/primary-subjects')
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
//     res.render('search/primary-subjects')
//   }
// }

exports.primary_subjects_get = async (req, res) => {
  res.render('search/primary-subjects', {
    // showError: req.query.showError
  })
}

exports.primary_subjects_post = async (req, res) => {
  const errors = []

  if (!req.session.data.subjects?.length) {
    const error = {}
    error.fieldName = "primary-subjects"
    error.href = "#primary-subjects"
    error.text = "Select a least one primary subject you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/primary-subjects', {
      showError: (errors.length)
    })
  } else {
    res.redirect('/results')
  }
}

exports.secondary_subjects_get = async (req, res) => {
  const q = req.session.data.q || req.query.q
  res.render('search/secondary-subjects', {
    // q,
    // sendItems: utils.sendItems(req.session.data.send)
  })
}

exports.secondary_subjects_post = async (req, res) => {
  const q = req.session.data.q || req.query.q

  const errors = []

  if (!req.session.data.subjects?.length) {
    const error = {}
    error.fieldName = "secondary-subjects"
    error.href = "#secondary-subjects"
    error.text = "Select at least one secondary subjects you want to teach"
    errors.push(error)
  }

  if (errors.length) {
    res.render('search/secondary-subjects', {
      // q,
      // sendItems: utils.sendItems(req.session.data.send),
      showError: (errors.length)
    })
  } else {
    res.redirect('/results')
  }
}

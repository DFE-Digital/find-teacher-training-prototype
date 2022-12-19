const questionModel = require('../../models/questions')

exports.location_or_provider_get = async (req, res) => {
  delete req.session.search

  const question = questionModel.findOne('location-or-provider')

  res.render('hackday/questions/index', {
    question,
    actions: {
      back: '#',
      save: '/hackday/questions/location-or-provider',
      cancel: '#'
    }
  })
}

exports.location_or_provider_post = async (req, res) => {
  const question = questionModel.findOne('location-or-provider')
  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back: '#',
        save: '/hackday/questions/location-or-provider',
        cancel: '#'
      }
    })
  } else {
    res.redirect('/hackday/questions/subject-level')
  }
}

exports.subject_level_get = async (req, res) => {
  const question = questionModel.findOne('subject-level')
  res.render('hackday/questions/index', {
    question,
    actions: {
      back: '/hackday/questions/location-or-provider',
      save: '/hackday/questions/subject-level',
      cancel: '#'
    }
  })
}

exports.subject_level_post = async (req, res) => {
  const question = questionModel.findOne('subject-level')
  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back: '/hackday/questions/location-or-provider',
        save: '/hackday/questions/subject-level',
        cancel: '#'
      }
    })
  } else {
    // if (true) {
    //   res.redirect('/hackday/questions/primary-subject')
    // } else {
      res.redirect('/hackday/questions/secondary-subject')
    // }
  }
}

exports.primary_subject_get = async (req, res) => {
  const question = questionModel.findOne('primary-subject')
  res.render('hackday/questions/index', {
    question,
    actions: {
      back: '/hackday/questions/subject-level',
      save: '/hackday/questions/primary-subject',
      cancel: '#'
    }
  })
}

exports.primary_subject_post = async (req, res) => {
  const question = questionModel.findOne('primary-subject')
  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back: '/hackday/questions/subject-level',
        save: '/hackday/questions/primary-subject',
        cancel: '#'
      }
    })
  } else {
    res.redirect('/hackday/questions/degree-grade')
  }
}

exports.secondary_subject_get = async (req, res) => {
  const question = questionModel.findOne('secondary-subject')
  res.render('hackday/questions/index', {
    question,
    actions: {
      back: '/hackday/questions/subject-level',
      save: '/hackday/questions/secondary-subject',
      cancel: '#'
    }
  })
}

exports.secondary_subject_post = async (req, res) => {
  const question = questionModel.findOne('secondary-subject')
  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back: '/hackday/questions/subject-level',
        save: '/hackday/questions/secondary-subject',
        cancel: '#'
      }
    })
  } else {
    res.redirect('/hackday/questions/interstitial')
  }
}

exports.interstitial_get = async (req, res) => {
  res.render('hackday/questions/interstitial', {
    actions: {
      back: '/hackday/questions/subject-level',
      next: '/hackday/questions/degree-grade',
      results: '/hackday',
      cancel: '#'
    }
  })
}

exports.degree_grade_get = async (req, res) => {
  const question = questionModel.findOne('degree-grade')

  let back = '/hackday/questions/primary-subject'
  if (true) {
    back = '/hackday/questions/secondary-subject'
  }

  res.render('hackday/questions/index', {
    question,
    actions: {
      back,
      save: '/hackday/questions/degree-grade',
      cancel: '#'
    }
  })
}

exports.degree_grade_post = async (req, res) => {
  const question = questionModel.findOne('degree-grade')

  let back = '/hackday/questions/primary-subject'
  if (true) {
    back = '/hackday/questions/secondary-subject'
  }

  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back,
        save: '/hackday/questions/degree-grade',
        cancel: '#'
      }
    })
  } else {
    res.redirect('/hackday/questions/right-to-work-or-study')
  }
}

exports.right_to_work_or_study_get = async (req, res) => {
  const question = questionModel.findOne('right-to-work-or-study')

  res.render('hackday/questions/index', {
    question,
    actions: {
      back: '/hackday/questions/degree-grade',
      save: '/hackday/questions/right-to-work-or-study',
      cancel: '#'
    }
  })
}

exports.right_to_work_or_study_post = async (req, res) => {
  const question = questionModel.findOne('right-to-work-or-study')

  const errors = []

  if (errors.length) {
    res.render('hackday/questions/index', {
      question,
      errors,
      actions: {
        back: '/hackday/questions/',
        save: '/hackday/questions/right-to-work-or-study',
        cancel: '#'
      }
    })
  } else {
    res.send('NOT IMPLEMENTED')
    // res.redirect('/hackday/questions/')
  }

}

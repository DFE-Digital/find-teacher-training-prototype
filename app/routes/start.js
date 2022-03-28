const utils = require('../utils')()
const locationSuggestions = require('../services/location-suggestions')

module.exports = router => {
  router.all('/search', async (req, res) => {
    const query = req.session.data.q || req.query.q
    const queryType = await utils.processQuery(query, req.session.data)
    const { filtering } = req.query

    res.redirect('/age-group')
  })

  router.get('/age-group', async (req, res) => {
    res.render('filters/age-group')
  })

  router.post('/age-group', async (req, res) => {
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
  })

//   router.get('/primary', async (req, res) => {
//     res.render('filters/primary')
//   })
//
//   router.post('/primary', async (req, res) => {
//     const primarySpecialistSubjectsAnswer = req.body.primarySpecialistSubjects
//
//     if (primarySpecialistSubjectsAnswer === 'yes') {
//       res.redirect('/primary-specialist-subject')
//     } else if (primarySpecialistSubjectsAnswer === 'no') {
//       // set subject to "Primary" only
//       req.session.data.subjects = ['00']
//
//       res.redirect('/results')
//     } else {
//       res.render('filters/primary')
//     }
//   })

  router.get('/primary-specialist-subject', async (req, res) => {
    res.render('filters/primary-specialist-subject', {
      showError: req.query.showError
    })
  })

  router.get('/subject', async (req, res) => {
    const q = req.session.data.q || req.query.q
    res.render('filters/subject', {
      backLink: {
        text: 'Back',
        href: '/'
      },
      q,
      sendItems: utils.sendItems(req.session.data.send)
    })
  })


  router.get('/', async (req, res) => {
    // Reset data
    // req.session.data = {}
    res.render('index')
  })

  router.get('/secondary/:subject', async (req, res) => {
    res.render('secondary-subject', {
      subject: req.params.subject
    })
  })

}

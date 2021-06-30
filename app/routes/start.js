const utils = require('../utils')()

module.exports = router => {
  router.all('/search', async (req, res) => {
    const qurey = req.session.data.q || req.query.q
    const queryType = await utils.processQuery(qurey, req.session.data)
    const { filtering } = req.query

    if (queryType === 'area' && filtering) {
      res.redirect(req.session.data.area.type === 'LBO' ? '/results/filters/london' : '/results/filters/subject')
    } else if (queryType === 'area') {
      res.redirect(req.session.data.area.type === 'LBO' ? '/london' : '/age-group')
    } else {
      res.redirect(queryType === 'provider' ? '/results' : '/age-group')
    }
  })

  router.get('/age-group', async (req, res) => {
    res.render('filters/age-group')
  })

  router.post('/age-group', async (req, res) => {
    const ageGroupAnswer = req.body.ageGroup

    if (ageGroupAnswer == "primary") {
      res.redirect('/primary')
    } else if (ageGroupAnswer == "secondary") {
      res.redirect('/subject')
    } else {
      res.render('filters/age-group')
    }
  })

  router.get('/primary', async (req, res) => {
    res.render('filters/primary')
  })

  router.post('/primary', async (req, res) => {
    const primarySpecialistSubjectsAnswer = req.body.primarySpecialistSubjects

    if (primarySpecialistSubjectsAnswer == "yes") {
      res.redirect('/primary-specialist-subject')
    } else if (primarySpecialistSubjectsAnswer == "no") {

      // set subject to "Primary" only
      req.session.data.subjects = ["00"]

      res.redirect('/results')
    } else {
      res.render('filters/primary')
    }
  })

  router.get('/primary-specialist-subject', async (req, res) => {
    res.render('filters/primary-specialist-subject')
  })


  router.get('/subject', async (req, res) => {
    const q = req.session.data.q || req.query.q
    res.render('filters/subject', {
      backLink:
        req.session.data.londonBorough
          ? {
              text: 'Back to London boroughs',
              href: '/london'
            }
          : {
              text: 'Back',
              href: '/'
            },
      q,
      subjectItems: utils.subjectItems(req.session.data.subjects, {
        showHintText: true,
        checkAll: false
      }),
      sendItems: utils.sendItems(req.session.data.send)
    })
  })

  router.get('/london', async (req, res) => {
    const q = req.session.data.q

    // If clicked on ‘London’ link, don’t automatically select ‘Westminster’
    const isFreetextSearch = q !== 'London'

    res.render('filters/london', {
      backLink: {
        text: 'Back',
        href: '/'
      },
      filtering: isFreetextSearch,
      items: {
        all: utils.londonBoroughItems(req.session.data.londonBorough),
        central: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'central', checked: isFreetextSearch }),
        east: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'east' }),
        north: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'north' }),
        south: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'south' }),
        west: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'west' })
      },
      next: '/age-group',
      startFlow: true
    })
  })

  router.post('/london', async (req, res) => {
    const { next } = req.query

    res.redirect(next)
  })

  router.get('/start', async (req, res) => {
    res.render('start')
  })

  router.get('/', async (req, res) => {
    // Reset data
    // req.session.data = {}
    res.render('index')
  })
}

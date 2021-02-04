const utils = require('../utils')()

const backLink = {
  text: 'Back to search results',
  href: '/results'
}

module.exports = router => {
  // Area
  router.get('/results/filters/query', async (req, res) => {
    const q = req.session.data.q || req.query.q
    const { filtering } = req.query

    res.render('filters/query', {
      backLink,
      filtering: filtering,
      q
    })
  })

  // London
  router.get('/results/filters/london', (req, res) => {
    req.session.data.location = 'London'
    req.session.data.provider = false

    const isFreetextSearch = req.query.q !== 'London'

    res.render('filters/london', {
      backLink,
      filtering: isFreetextSearch,
      items: {
        all: utils.londonBoroughItems(req.session.data.londonBorough),
        central: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'central' }),
        east: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'east' }),
        north: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'north' }),
        south: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'south' }),
        west: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'west' })
      },
      next: '/results'
    })
  })

  // Subject
  router.get('/results/filters/subject', async (req, res) => {
    const q = req.session.data.q || req.query.q
    res.render('filters/subject', {
      backLink,
      q,
      subjectItems: utils.subjectItems(req.session.data.subjects, {
        showHintText: true,
        checkAll: false
      }),
      sendItems: utils.sendItems(req.session.data.send)
    })
  })
}

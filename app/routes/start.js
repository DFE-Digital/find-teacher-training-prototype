const utils = require('../utils')()

module.exports = router => {
  router.all('/search', async (req, res) => {
    const qurey = req.session.data.q || req.query.q
    const queryType = await utils.processQuery(qurey, req.session.data)
    const { filtering } = req.query

    if (queryType === 'area' && filtering) {
      res.redirect(req.session.data.area.type === 'LBO' ? '/results/filters/london' : '/results/filters/subject')
    } else if (queryType === 'area') {
      res.redirect(req.session.data.area.type === 'LBO' ? '/london' : '/subject')
    } else {
      res.redirect(queryType === 'provider' ? '/results' : '/subject')
    }
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
      next: '/subject',
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
    req.session.data = {}
    res.render('index')
  })
}

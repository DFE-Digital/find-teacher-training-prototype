const utils = require('../utils')()

const backLink = {
  text: 'Back to search results',
  href: '/results'
}

module.exports = router => {
  // London
  router.get('/results/filters/london', (req, res) => {
    res.render('filters/london', {
      backLink,
      filtering: true,
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
}

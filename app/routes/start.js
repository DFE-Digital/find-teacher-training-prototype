const utils = require('../utils')()

module.exports = router => {
  router.get('/', (req, res) => {
    const {
      defaults,
      salaryOptions,
      studyTypeOptions
    } = req.session.data

    const levelItems = [{
      value: 'primary',
      text: 'Primary'
    }, {
      value: 'secondary',
      text: 'Secondary'
    }, {
      value: 'further_education',
      text: 'Further education'
    }]

    const salaryItems = salaryOptions.map(option => {
      const salary = req.session.data.salary || defaults.salary
      return {
        value: option.value,
        text: option.text,
        checked: salary === option.value
      }
    })

    const studyTypeItems = studyTypeOptions.map(option => {
      const studyType = req.session.data.studyType || defaults.studyType
      return {
        value: option.value,
        text: option.text,
        checked: studyType.includes(option.value)
      }
    })

    res.render('index', {
      levelItems,
      salaryItems,
      studyTypeItems
    })
  })

  router.all('/search', async (req, res) => {
    const qurey = req.session.data.q || req.query.q
    const queryType = await utils.processQuery(qurey, req.session.data)
    if (queryType === 'area') {
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
              text: 'Back to location',
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
    res.render('filters/london', {
      backLink: {
        text: 'Back to location',
        href: '/'
      },
      items: {
        central: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'central', checked: false }),
        east: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'east' }),
        north: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'north' }),
        south: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'south' }),
        west: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'west' })
      },
      next: '/subject'
    })
  })

  router.post('/london', async (req, res) => {
    const { next } = req.query

    res.redirect(next)
  })

  router.get('/start', async (req, res) => {
    res.render('start')
  })
}

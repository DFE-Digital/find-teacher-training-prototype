const locationModel = require('../models/location')
const teacherTrainingModel = require('../models/teacher-training')
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

  router.post('/search', async (req, res) => {
    const queryType = await utils.processQuery(req.session.data)
    if (queryType === 'area') {
      res.redirect(req.session.data.area.type === 'LBO' ? '/london' : '/subject')
    } else {
      res.redirect(queryType === 'provider' ? '/results' : '/subject')
    }
  })

  router.get('/subject', async (req, res) => {
    const { q } = req.query
    const { londonBorough, subjects } = req.session.data

    if (q) {
      const { latitude, longitude } = await utils.geocode(q)
      req.session.data.latitude = latitude
      req.session.data.longitude = longitude
    }

    res.render('filters/subject', {
      backLink:
        londonBorough
          ? {
              text: 'Back to London boroughs',
              href: '/london'
            }
          : {
              text: 'Back to location',
              href: '/'
            },
      subjectItems: utils.subjectItems(subjects, {
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
      next: '/subject',
      items: {
        all: utils.londonBoroughItems(req.session.data.londonBorough),
        central: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'central' }),
        east: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'east' }),
        north: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'north' }),
        south: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'south' }),
        west: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'west' })
      },
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
}

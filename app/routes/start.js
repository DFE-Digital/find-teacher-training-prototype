const locationModel = require('../models/location')
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
    // Convert free text location to latitude/longitude
    const { latitude, longitude } = await utils.geocode(req.session.data.location)
    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    // Get area name from latitude/longitude
    const area = await locationModel.getPoint(latitude, longitude)
    req.session.data.londonBorough = area.codes['local-authority-eng']

    // Redirect to London search filter if in London TTW area
    res.redirect(area.type === 'LBO' ? '/london' : '/subject')
  })

  router.get('/subject', async (req, res) => {
    const { location, londonBorough, subjects } = req.session.data

    if (location) {
      const { latitude, longitude } = await utils.geocode(location)
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
        showHintText: true
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

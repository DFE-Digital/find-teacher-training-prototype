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

  router.get('/subject', async (req, res) => {
    const { location, subjects } = req.session.data

    if (location) {
      const { latitude, longitude } = await utils.geocode(location)
      req.session.data.latitude = latitude
      req.session.data.longitude = longitude
    }

    res.render('filters/subject', {
      backLink: {
        text: 'Back to location',
        href: '/'
      },
      subjectItems: utils.subjectItems(subjects, {
        showHintText: true
      }),
      sendItems: utils.sendItems(req.session.data.send)
    })
  })

  router.get('/start', async (req, res) => {
    res.render('start')
  })
}

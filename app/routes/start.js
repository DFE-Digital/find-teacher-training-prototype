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
    const { levels, send, subjectOptions } = req.session.data
    const groups = utils.getSubjectGroups(levels, send, subjectOptions)

    const { latitude, longitude } = await utils.geocode(req.query.location)
    req.session.data.latitude = latitude
    req.session.data.longitude = longitude

    const backLink = {
      text: 'Back to location',
      href: '/'
    }

    res.render('filters/subject', { backLink, groups, send })
  })

  router.get('/start', async (req, res) => {
    res.render('start')
  })
}

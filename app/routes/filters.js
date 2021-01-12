const utils = require('../utils')()

const backLink = {
  text: 'Back to search results',
  href: '/results'
}

module.exports = router => {
  // Location
  router.get('/results/filters/location', (req, res) => {
    res.render('filters/location', { backLink })
  })

  // London
  router.get('/results/filters/london', (req, res) => {
    res.render('filters/london', {
      backLink,
      next: '/results',
      items: {
        all: utils.londonBoroughItems(req.session.data.londonBorough),
        central: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'central' }),
        east: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'east' }),
        north: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'north' }),
        south: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'south' }),
        west: utils.londonBoroughItems(req.session.data.londonBorough, { regionFilter: 'west' })
      }
    })
  })

  // Qualification
  router.get('/results/filters/qualification', (req, res) => {
    res.render('filters/qualification', {
      backLink,
      items: utils.qualificationItems(req.session.data.qualification)
    })
  })

  // Salary
  router.get('/results/filters/salary', function (req, res) {
    res.render('filters/salary', {
      backLink,
      items: utils.salaryItems(req.session.data.salary)
    })
  })

  // Study type
  router.get('/results/filters/study-type', function (req, res) {
    res.render('filters/study-type', {
      backLink,
      items: utils.studyTypeItems(req.session.data.studyType)
    })
  })

  // Subject/SEND
  router.get('/results/filters/subject', async (req, res) => {
    res.render('filters/subject', {
      backLink,
      subjectItems: utils.subjectItems(req.session.data.subjects, {
        showHintText: true
      }),
      sendItems: utils.sendItems(req.session.data.send)
    })
  })

  // Vacancies
  router.get('/results/filters/vacancy', function (req, res) {
    res.render('filters/vacancy', {
      backLink,
      items: utils.vacancyItems(req.session.data.vacancy)
    })
  })
}

const filters = require('../filters')()

module.exports = router => {
  // Qualification
  router.get('/results/filters/qualification', function (req, res) {
    const { qualificationOptions, selectedQualificationOption } = req.session.data

    const backLink = {
      text: 'Back to search results',
      href: '/results'
    }

    const items = qualificationOptions.map(option => {
      return {
        value: option.value,
        text: option.text,
        label: { classes: 'govuk-label--s' },
        hint: { text: filters.markdown(option.hint) },
        checked: selectedQualificationOption.includes(option.value)
      }
    })

    res.render('filters/qualification', { backLink, items })
  })

  // Salary
  router.get('/results/filters/salary', function (req, res) {
    const { salaryOptions, selectedSalaryOption } = req.session.data

    const backLink = {
      text: 'Back to search results',
      href: '/results'
    }

    const items = salaryOptions.map(option => {
      return {
        value: option.value,
        text: option.text,
        checked: selectedSalaryOption === option.value
      }
    })

    res.render('filters/salary', { backLink, items })
  })

  // Study type
  router.get('/results/filters/study-type', function (req, res) {
    const { studyTypeOptions, selectedStudyTypeOption } = req.session.data

    const backLink = {
      text: 'Back to search results',
      href: '/results'
    }

    const items = studyTypeOptions.map(option => {
      return {
        value: option.value,
        text: option.text,
        label: { classes: 'govuk-label--s' },
        hint: { text: option.hint },
        checked: selectedStudyTypeOption.includes(option.value)
      }
    })

    res.render('filters/study-type', { backLink, items })
  })

  // Vacancies
  router.get('/results/filters/vacancy', function (req, res) {
    const { vacancyOptions, selectedVacancyOption } = req.session.data

    const backLink = {
      text: 'Back to search results',
      href: '/results'
    }

    const items = vacancyOptions.map(option => {
      return {
        value: option.value,
        text: option.text,
        checked: selectedVacancyOption === option.value
      }
    })

    res.render('filters/vacancy', { backLink, items })
  })
}

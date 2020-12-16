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
}

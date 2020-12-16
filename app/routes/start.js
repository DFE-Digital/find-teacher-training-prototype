module.exports = router => {
  router.get('/start', (req, res) => {
    const {
      salaryOptions,
      studyTypeOptions,
      selectedSalaryOption,
      selectedStudyTypeOption
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
      return {
        value: option.value,
        text: option.text,
        checked: selectedSalaryOption === option.value
      }
    })

    const studyTypeItems = studyTypeOptions.map(option => {
      return {
        value: option.value,
        text: option.text,
        checked: selectedStudyTypeOption.includes(option.value)
      }
    })

    res.render('start', {
      levelItems,
      salaryItems,
      studyTypeItems
    })
  })
}

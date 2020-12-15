module.exports = router => {
  router.get('/start', (req, res) => {
    const {
      salaryOptions,
      subjectOptions,
      studyTypeOptions,
      selectedSalaryOption,
      selectedStudyTypeOption
    } = req.session.data

    const subjectItems = [{
      value: subjectOptions.filter(subject => subject.type === 'primary').map(option => option.value),
      text: 'Primary'
    }, {
      value: subjectOptions.filter(subject => (subject.type === 'secondary') || (subject.type === 'secondary_language')).map(option => option.value),
      text: 'Secondary'
    }, {
      value: subjectOptions.filter(subject => subject.type === 'further_education').map(option => option.value),
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
      salaryItems,
      subjectItems,
      studyTypeItems
    })
  })
}

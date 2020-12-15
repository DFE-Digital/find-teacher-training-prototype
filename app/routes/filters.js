module.exports = router => {
  router.get('/results/filters/study-type', function (req, res) {
    const { studyTypes, selectedStudyTypes } = req.session.data

    const backLink = {
      text: 'Back to search results',
      href: '/results'
    }

    const items = studyTypes.map(studyType => {
      return {
        value: studyType.value,
        text: studyType.text,
        label: { classes: 'govuk-label--s' },
        hint: { text: studyType.hint },
        checked: selectedStudyTypes.includes(studyType.value)
      }
    })

    res.render('filters/study-type', { backLink, items })
  })
}

exports.getCheckboxValues = (name, data) => {
  return name && (Array.isArray(name)
    ? name
    : [name].filter((name) => {
        return name !== '_unchecked'
      })) || data && (Array.isArray(data) ? data : [data])
}

exports.removeFilter = (value, data) => {
  // do this check because if coming from overview page for example,
  // the query/param will be a string value, not an array containing a string
  if (Array.isArray(data)) {
    return data.filter(item => item !== value)
  } else {
    return null
  }
}
exports.getSubjectItems = (selectedItems, subjectLevel = null) => {
  let subjects = require('../data/subjects')
  const items = []

  if (subjectLevel) {
    subjects = subjects.filter(subject => subject.level === subjectLevel)
  }

  subjects.forEach((subject, i) => {
    const item = {}

    item.text = subject.name
    item.value = subject.code
    item.id = subject.id
    item.checked = (selectedItems && selectedItems.includes(subject.name)) ? 'checked' : ''

    items.push(item)
  })

  items.sort((a,b) => {
    return a.text.localeCompare(b.text)
  })

  return items
}

exports.getSubjectLabel = (subjectCode) => {
  const subjects = require('../data/subjects')
  let label

  if (subjectCode) {
    label = subjects.filter(subject => subject.code === subjectCode).name
  }

  return label
}

exports.getSelectedSubjectItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const subject = {}
    subject.text = item.text
    subject.href = `/results/remove-subject-filter/${item.text}`

    items.push(subject)
  })

  return items
}

exports.getStudyModeItems = (selectedItems) => {
  const studyModes = require('../data/study-modes')
  const items = []

  studyModes.forEach((studyMode, i) => {
    const item = {}

    item.text = studyMode.name
    item.value = studyMode.code
    item.id = studyMode.id
    item.checked = (selectedItems && selectedItems.includes(studyMode.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getStudyModeLabel = (studyModeCode) => {
  const studyModes = require('../data/study-modes')
  let label

  if (studyModeCode) {
    label = studyModes.filter(studyMode => studyMode.code === studyModeCode).name
  }

  return label
}

exports.getSelectedStudyMode = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const mode = {}
    mode.text = item.text
    mode.href = `/results/remove-study-mode-filter/${item.text}`

    items.push(mode)
  })

  return items
}

exports.getQualificationItems = (selectedItems, subjectLevel = null) => {
  let qualifications = require('../data/qualifications')
  const items = []

  if (subjectLevel) {
    qualifications = qualifications.filter(qualification => qualification.levels.includes(subjectLevel))
  }

  qualifications.forEach((qualification, i) => {
    const item = {}

    item.text = qualification.name
    item.value = qualification.code
    item.id = qualification.id
    item.checked = (selectedItems && selectedItems.includes(qualification.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getQualificationLabel = (qualificationCode) => {
  const qualifications = require('../data/qualifications')
  let label

  if (qualificationCode) {
    label = qualifications.filter(qualification => qualification.code === qualificationCode).name
  }

  return label
}

exports.getSelectedQualification = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const mode = {}
    mode.text = item.text
    mode.href = `/results/remove-qualification-filter/${item.text}`

    items.push(mode)
  })

  return items
}

exports.getDegreeGradeItems = (selectedItems) => {
  const degreeGrades = require('../data/degree-grades')
  const items = []

  degreeGrades.forEach((degreeGrade, i) => {
    const item = {}

    item.text = degreeGrade.name
    item.value = degreeGrade.code
    item.id = degreeGrade.id
    item.checked = (selectedItems && selectedItems.includes(degreeGrade.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getDegreeGradeLabel = (degreeGradeCode) => {
  const degreeGrades = require('../data/degree-grades')
  let label

  if (degreeGradeCode) {
    label = degreeGrades.filter(degreeGrade => degreeGrade.code === degreeGradeCode).name
  }

  return label
}

exports.getSelectedDegreeGrade = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const mode = {}
    mode.text = item.text
    mode.href = `/results/remove-degree-grade-filter/${item.text}`

    items.push(mode)
  })

  return items
}

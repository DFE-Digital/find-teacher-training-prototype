const sendOptions = [{
  id: '5289e0bd-830b-46f6-948e-685214651beb',
  name: 'Only show courses with a SEND specialism',
  code: 'include'
}]

const vacancyOptions = [{
  id: 'a4de2c9c-553f-4cea-8dd5-696afb02c06a',
  name: 'Only show courses with vacancies',
  code: 'include'
}]

const visaSponsorshipOptions = [{
  id: '8bf5f687-eda9-4299-9105-7966b3f0fa38',
  name: 'Only show courses with visa sponsorship',
  code: 'include'
}]

const fundingTypeOptions = [{
  id: '1c909417-4192-4de3-bc52-c9ebee5e7e4e',
  name: 'Only show courses with a salary',
  code: 'include'
}]

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
    label = subjects.find(subject => subject.code === subjectCode).name
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

exports.getSendItems = (selectedItems) => {
  const items = []

  sendOptions.forEach((send, i) => {
    const item = {}

    item.text = send.name
    item.value = send.code
    item.id = send.id
    item.checked = (selectedItems && selectedItems.includes(send.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getSendLabel = (sendCode) => {
  let label

  if (sendCode) {
    label = sendOptions.find(send => send.code === sendCode).name
  }

  return label
}

exports.getSelectedSendItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const send = {}
    send.text = item.text
    send.href = `/results/remove-send-filter/${item.text}`

    items.push(send)
  })

  return items
}

exports.getVacancyItems = (selectedItems) => {
  const items = []

  vacancyOptions.forEach((vacancy, i) => {
    const item = {}

    item.text = vacancy.name
    item.value = vacancy.code
    item.id = vacancy.id
    item.checked = (selectedItems && selectedItems.includes(vacancy.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getVacancyLabel = (vacancyCode) => {
  let label

  if (vacancyCode) {
    label = vacancyOptions.find(vacancy => vacancy.code === vacancyCode).name
  }

  return label
}

exports.getSelectedVacancyItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const vacancy = {}
    vacancy.text = item.text
    vacancy.href = `/results/remove-vacancy-filter/${item.text}`

    items.push(vacancy)
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
    label = studyModes.find(studyMode => studyMode.code === studyModeCode).name
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
    label = qualifications.find(qualification => qualification.code === qualificationCode).name
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
    label = degreeGrades.find(degreeGrade => degreeGrade.code === degreeGradeCode).name
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

exports.getVisaSponsorshipItems = (selectedItems) => {
  const items = []

  visaSponsorshipOptions.forEach((visaSponsorship, i) => {
    const item = {}

    item.text = visaSponsorship.name
    item.value = visaSponsorship.code
    item.id = visaSponsorship.id
    item.checked = (selectedItems && selectedItems.includes(visaSponsorship.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getVisaSponsorshipLabel = (visaSponsorshipCode) => {
  let label

  if (visaSponsorshipCode) {
    label = visaSponsorshipOptions.find(visaSponsorship => visaSponsorship.code === visaSponsorshipCode).name
  }

  return label
}

exports.getSelectedVisaSponsorshipItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const visaSponsorship = {}
    visaSponsorship.text = item.text
    visaSponsorship.href = `/results/remove-visa-sponsorship-filter/${item.text}`

    items.push(visaSponsorship)
  })

  return items
}

exports.getFundingTypeItems = (selectedItems) => {
  const items = []

  fundingTypeOptions.forEach((fundingType, i) => {
    const item = {}

    item.text = fundingType.name
    item.value = fundingType.code
    item.id = fundingType.id
    item.checked = (selectedItems && selectedItems.includes(fundingType.name)) ? 'checked' : ''

    items.push(item)
  })

  return items
}

exports.getFundingTypeLabel = (fundingTypeCode) => {
  let label

  if (fundingTypeCode) {
    label = fundingTypeOptions.find(fundingType => fundingType.code === fundingTypeCode).name
  }

  return label
}

exports.getSelectedFundingTypeItems = (selectedItems) => {
  const items = []

  selectedItems.forEach((item) => {
    const fundingType = {}
    fundingType.text = item.text
    fundingType.href = `/results/remove-funding-type-filter/${item.text}`

    items.push(fundingType)
  })

  return items
}

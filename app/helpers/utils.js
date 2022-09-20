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

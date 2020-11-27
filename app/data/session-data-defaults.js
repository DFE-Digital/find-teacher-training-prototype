const courses = require('./courses.json')

module.exports = {
  seenApplyWithChoice: false,
  seenApplyWithoutChoice: false,
  studyType: [
    'Full time (12 months)',
    'Part time (18-24 months)'
  ],
  salary: 'All courses (with or without a salary)',
  qualification: [
    'PGCE with QTS (Postgraduate certificate in education with qualified teacher status)',
    'QTS (Qualified teacher status)'
  ],
  latLong: {
    lat: 52.6033,
    lng: -1.4183
  },
  selectedSubjects: [],
  groupedSubjects: courses.groupedSubjects,
  subjects: courses.subjects,
  courses: courses.courses
}

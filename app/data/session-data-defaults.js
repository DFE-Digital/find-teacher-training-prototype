module.exports = {
  salaryOptions: [{
    text: 'Courses with and without salary',
    value: 'salary,apprenticeship,fee'
  }, {
    text: 'Only courses that come with a salary',
    value: 'salary'
  }],
  studyTypes: [{
    text: 'Full time (12 months)',
    hint: 'You’ll usually spend 5 days a week on a full-time course',
    value: 'full_time'
  }, {
    text: 'Part time (18-24 months)',
    hint: 'You’ll usually spend 3 days a week on a part-time course',
    value: 'part_time'
  }],
  vacancyOptions: [{
    text: 'Only courses with vacancies',
    value: 'true'
  }, {
    text: 'Courses with and without vacancies',
    value: 'false'
  }],
  selectedSalaryOption: 'salary,apprenticeship,fee',
  selectedStudyTypes: ['full_time', 'part_time'],
  selectedVacancyOption: 'false',
  qualification: [
    'PGCE with QTS (Postgraduate certificate in education with qualified teacher status)',
    'QTS (Qualified teacher status)'
  ],
  latLong: {
    lat: 52.6033,
    lng: -1.4183
  },
  selectedSubjects: []
}

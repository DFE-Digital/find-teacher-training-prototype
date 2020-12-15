module.exports = {
  qualificationOptions: [{
    text: 'QTS only',
    hint: 'QTS (qualified teacher status) allows you to teach in state schools in England and may allow you to teach in other parts of the UK.\n\nIt may also allow you to teach in the [EU and EEA](https://www.gov.uk/eu-eea), though this could change after 2020. If you’re planning to teach overseas, you should always check what’s needed in the country you’d like to teach in.',
    value: 'qts'
  }, {
    text: 'PGCE (or PGDE) with QTS',
    hint: 'A PGCE (postgraduate certificate in education) is an academic qualification in education. PGCE with QTS allows you to teach in state schools in England and may allow you to teach in other parts of the UK.\n\nIt may also allow you to teach in the [EU and EEA](https://www.gov.uk/eu-eea), though this could change after 2020. If you’re planning to teach overseas, you should always check what’s needed in the country you’d like to teach in.\n\nMany PGCE courses include credits towards a Master’s degree. Some providers offer a PGDE (postgraduate diploma in education) with QTS, which is equivalent to a PGCE. In some cases these offer more Master’s credits than PGCE courses.',
    value: 'pgce_with_qts,pgde_with_qts'
  }, {
    text: 'Further education (PGCE or PGDE without QTS)',
    hint: 'To teach further education you don’t need QTS. Instead you can study for a PGCE or PGDE without QTS.',
    value: 'pgce,pgde'
  }],
  salaryOptions: [{
    text: 'Courses with and without salary',
    value: 'salary,apprenticeship,fee'
  }, {
    text: 'Only courses that come with a salary',
    value: 'salary'
  }],
  studyTypeOptions: [{
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
  selectedQualificationOption: ['qts'],
  selectedSalaryOption: 'salary,apprenticeship,fee',
  selectedStudyTypeOption: ['full_time', 'part_time'],
  selectedVacancyOption: 'false',
  latLong: {
    lat: 52.6033,
    lng: -1.4183
  },
  selectedSubjects: []
}

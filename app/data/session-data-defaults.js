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
  subjectOptions: [{
    text: 'Primary',
    type: 'primary',
    value: '00'
  }, {
    text: 'Primary with English',
    type: 'primary',
    value: '01'
  }, {
    text: 'Primary with geography and history',
    type: 'primary',
    value: '02'
  }, {
    text: 'Primary with mathematics',
    type: 'primary',
    value: '03'
  }, {
    text: 'Primary with modern languages',
    type: 'primary',
    value: '04'
  }, {
    text: 'Primary with physical education',
    type: 'primary',
    value: '06'
  }, {
    text: 'Primary with science',
    type: 'primary',
    value: '07'
  }, {
    text: 'Art and design',
    type: 'secondary',
    value: 'W1'
  }, {
    text: 'Biology',
    hint: 'Bursaries of £7,000 available.',
    type: 'secondary',
    value: 'C1'
  }, {
    text: 'Business studies',
    type: 'secondary',
    value: '08'
  }, {
    text: 'Chemistry',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available.',
    type: 'secondary',
    value: 'F1'
  }, {
    text: 'Citizenship',
    type: 'secondary',
    value: '09'
  }, {
    text: 'Classics',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary',
    value: 'Q8'
  }, {
    text: 'Communication and media studies',
    type: 'secondary',
    value: 'P3'
  }, {
    text: 'Computing',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available.',
    type: 'secondary',
    value: '11'
  }, {
    text: 'Dance',
    type: 'secondary',
    value: '12'
  }, {
    text: 'Design and technology – also includes food, product design, textiles, and systems and control',
    type: 'secondary',
    value: 'DT'
  }, {
    text: 'Drama',
    type: 'secondary',
    value: '13'
  }, {
    text: 'Economics',
    type: 'secondary',
    value: 'L1'
  }, {
    text: 'English',
    type: 'secondary',
    value: 'Q3'
  }, {
    text: 'Geography',
    type: 'secondary',
    value: 'F8'
  }, {
    text: 'Health and social care',
    type: 'secondary',
    value: 'L5'
  }, {
    text: 'History',
    type: 'secondary',
    value: 'V1'
  }, {
    text: 'Mathematics',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available.',
    type: 'secondary',
    value: 'G1'
  }, {
    text: 'Music',
    type: 'secondary',
    value: 'W3'
  }, {
    text: 'Philosophy',
    type: 'secondary',
    value: 'P1'
  }, {
    text: 'Physical education',
    type: 'secondary',
    value: 'C6'
  }, {
    text: 'Physics',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available.',
    type: 'secondary',
    value: 'F3'
  }, {
    text: 'Psychology',
    type: 'secondary',
    value: 'C8'
  }, {
    text: 'Religious education',
    type: 'secondary',
    value: 'V6'
  }, {
    text: 'Science',
    type: 'secondary',
    value: 'F0'
  }, {
    text: 'Social sciences',
    type: 'secondary',
    value: '14'
  }, {
    text: 'English as a second or other language',
    type: 'secondary_language',
    value: '16'
  }, {
    text: 'French',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '15'
  }, {
    text: 'German',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '17'
  }, {
    text: 'Italian',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '18'
  }, {
    text: 'Japanese',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '19'
  }, {
    text: 'Mandarin',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '20'
  }, {
    text: 'Modern languages (other)',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '24'
  }, {
    text: 'Russian',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '21'
  }, {
    text: 'Spanish',
    hint: 'Bursaries of £10,000 available.',
    type: 'secondary_language',
    value: '22'
  }, {
    text: 'Further education',
    type: 'further_education',
    value: '41'
  }],
  vacancyOptions: [{
    text: 'Only courses with vacancies',
    value: 'true'
  }, {
    text: 'Courses with and without vacancies',
    value: 'false'
  }],
  selectedQualificationOption: ['qts', 'pgce_with_qts,pgde_with_qts', 'pgce,pgde'],
  selectedSalaryOption: 'salary,apprenticeship,fee',
  selectedSubjectOption: ['00'],
  selectedStudyTypeOption: ['full_time', 'part_time'],
  selectedVacancyOption: 'false',
  levels: [{
    text: 'Primary',
    value: 'primary'
  }, {
    text: 'Secondary',
    value: 'secondary'
  }, {
    text: 'Secondary: Modern languages',
    value: 'secondary_language'
  }, {
    text: 'Further education',
    value: 'further_education'
  }],
  latLong: {
    lat: 52.6033,
    lng: -1.4183
  }
}

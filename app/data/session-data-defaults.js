module.exports = {
  apiEndpoint: 'https://api.publish-teacher-training-courses.service.gov.uk/api/public/v1',
  cycle: 2022,
  nearingEndOfCycle: false,
  defaults: {
    latitude: false,
    longitude: false,
    qualification: ['qts', 'pgce_with_qts,pgde_with_qts', 'pgce,pgde'],
    salary: 'salary,apprenticeship,fee',
    send: ['exclude'],
    studyType: ['full_time', 'part_time'],
    subjects: [],
    vacancy: ['include'],
    degreeGrade: ['two_one', 'two_two', 'third_class', 'not_required'],
    visaSponsorship: ['exclude']
  },
  qualificationOptions: [{
    text: 'QTS only',
    hint: 'Qualified teacher status (QTS) allows you to teach in state schools in England and may allow you to teach in other parts of the UK.\n\nIt may also allow you to teach in the [EU and EEA](https://www.gov.uk/eu-eea), though this could change after 2020.\n\nIf you’re planning to teach overseas, you should always check what’s needed in the country you’d like to teach in.',
    value: 'qts'
  }, {
    text: 'PGCE (or PGDE) with QTS',
    hint: 'A postgraduate certificate in education (PGCE) is an academic qualification in education. PGCE with QTS allows you to teach in state schools in England and may allow you to teach in other parts of the UK.\n\nIt may also allow you to teach in the [EU and EEA](https://www.gov.uk/eu-eea), though this could change after 2020. If you’re planning to teach overseas, you should always check what’s needed in the country you’d like to teach in.\n\nMany PGCE courses include credits towards a Master’s degree. Some providers offer a PGDE (postgraduate diploma in education) with QTS, which is equivalent to a PGCE. In some cases these offer more Master’s credits than PGCE courses.',
    value: 'pgce_with_qts,pgde_with_qts'
  }, {
    text: 'Further education (PGCE or PGDE without QTS)',
    hint: 'To teach further education you don’t need QTS. Instead you can study for a PGCE or PGDE without QTS.',
    value: 'pgce,pgde'
  }],
  degreeGradeOptions: [{
    text: '2:1 or first',
    value: 'two_one'
  }, {
    text: '2:2',
    value: 'two_two'
  }, {
    text: 'Third',
    value: 'third_class'
  }, {
    text: 'Pass (ordinary degree)',
    value: 'not_required'
  }],
  fundingTypeOptions: [{
    text: 'Only show courses that come with a salary',
    value: ['include']
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
  sendOptions: [{
    text: 'Only show courses with a SEND specialism',
    name: 'send',
    value: ['include']
  }],
  vacancyOptions: [{
    text: 'Only show courses with vacancies',
    value: ['include']
  }],
  visaSponsorshipOptions: [{
    text: 'Only show courses with visa sponsorship',
    name: 'visaSponsorship',
    value: ['include']
  }],
  subjectOptions: [{
    text: 'Primary',
    ageGroup: 'primary',
    value: '00'
  }, {
    text: 'Primary with English',
    ageGroup: 'primary',
    value: '01'
  }, {
    text: 'Primary with geography and history',
    ageGroup: 'primary',
    value: '02'
  }, {
    text: 'Primary with mathematics',
    ageGroup: 'primary',
    value: '03',
    hasSke: true
  }, {
    text: 'Primary with modern languages',
    ageGroup: 'primary',
    value: '04'
  }, {
    text: 'Primary with physical education',
    ageGroup: 'primary',
    value: '06'
  }, {
    text: 'Primary with science',
    ageGroup: 'primary',
    value: '07'
  }, {
    text: 'Art and design',
    ageGroup: 'secondary',
    value: 'W1'
  }, {
    text: 'Biology',
    hint: 'Bursaries of £10,000 available',
    ageGroup: 'secondary',
    value: 'C1',
    hasSke: true
  }, {
    text: 'Business studies',
    ageGroup: 'secondary',
    value: '08'
  }, {
    text: 'Chemistry',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available',
    ageGroup: 'secondary',
    value: 'F1',
    hasSke: true
  }, {
    text: 'Citizenship',
    ageGroup: 'secondary',
    value: '09'
  }, {
    text: 'Classics',
    ageGroup: 'secondary',
    value: 'Q8'
  }, {
    text: 'Communication and media studies',
    ageGroup: 'secondary',
    value: 'P3'
  }, {
    text: 'Computing',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available',
    ageGroup: 'secondary',
    value: '11',
    hasSke: true
  }, {
    text: 'Dance',
    ageGroup: 'secondary',
    value: '12'
  }, {
    text: 'Design and technology',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: 'DT',
    hasSke: true
  }, {
    text: 'Drama',
    ageGroup: 'secondary',
    value: '13'
  }, {
    text: 'Economics',
    ageGroup: 'secondary',
    value: 'L1'
  }, {
    text: 'English',
    ageGroup: 'secondary',
    value: 'Q3',
    hasSke: true
  }, {
    text: 'Geography',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: 'F8'
  }, {
    text: 'Health and social care',
    ageGroup: 'secondary',
    value: 'L5'
  }, {
    text: 'History',
    ageGroup: 'secondary',
    value: 'V1'
  }, {
    text: 'Mathematics',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available',
    ageGroup: 'secondary',
    value: 'G1',
    hasSke: true
  }, {
    text: 'Music',
    ageGroup: 'secondary',
    value: 'W3'
  }, {
    text: 'Philosophy',
    ageGroup: 'secondary',
    value: 'P1'
  }, {
    text: 'Physical education',
    ageGroup: 'secondary',
    value: 'C6'
  }, {
    text: 'Physics',
    hint: 'Scholarships of £26,000 and bursaries of £24,000 are available',
    ageGroup: 'secondary',
    value: 'F3',
    hasSke: true
  }, {
    text: 'Psychology',
    ageGroup: 'secondary',
    value: 'C8'
  }, {
    text: 'Religious education',
    ageGroup: 'secondary',
    value: 'V6',
    hasSke: true
  }, {
    text: 'Science',
    ageGroup: 'secondary',
    value: 'F0'
  }, {
    text: 'Social sciences',
    ageGroup: 'secondary',
    value: '14'
  }, {
    text: 'English as a second or other language',
    ageGroup: 'secondary',
    value: '16'
  }, {
    text: 'French',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '15',
    hasSke: true
  }, {
    text: 'German',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '17',
    hasSke: true
  }, {
    text: 'Italian',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '18',
    hasSke: true
  }, {
    text: 'Japanese',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '19',
    hasSke: true
  }, {
    text: 'Mandarin',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '20',
    hasSke: true
  }, {
    text: 'Modern languages (other)',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '24',
    hasSke: true
  }, {
    text: 'Russian',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '21',
    hasSke: true
  }, {
    text: 'Spanish',
    hint: 'Bursaries of £15,000 available',
    ageGroup: 'secondary',
    value: '22',
    hasSke: true
  }, {
    text: 'Further education',
    ageGroup: 'furtherEducation',
    value: '41'
  }]
}

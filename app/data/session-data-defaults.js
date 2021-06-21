module.exports = {
  apiEndpoint: 'https://api.publish-teacher-training-courses.service.gov.uk/api/public/v1',
  cycle: 2021,
  defaults: {
    latitude: false,
    longitude: false,
    londonBorough: false,
    qualification: ['qts', 'pgce_with_qts,pgde_with_qts', 'pgce,pgde'],
    salary: 'salary,apprenticeship,fee',
    send: ['exclude'],
    studyType: ['full_time', 'part_time'],
    subjects: [],
    vacancy: ['include'],
    entryRequirement: ['21','22','third','degree']
  },
  londonSubRegions: [{
    text: 'Central London',
    value: 'central'
  }, {
    text: 'East London',
    value: 'east'
  }, {
    text: 'North London',
    value: 'north'
  }, {
    text: 'South London',
    value: 'south'
  }, {
    text: 'West London',
    value: 'west'
  }],
  londonBoroughOptions: [{
    text: 'Barking and Dagenham',
    value: 'BDG',
    region: 'east'
  }, {
    text: 'Barnet',
    value: 'BNE',
    region: 'north'
  }, {
    text: 'Bexley',
    value: 'BEX',
    region: 'east'
  }, {
    text: 'Brent',
    value: 'BEN',
    region: 'west'
  }, {
    text: 'Bromley',
    value: 'BRY',
    region: 'south'
  }, {
    text: 'Camden',
    value: 'CMD',
    region: 'central'
  }, {
    text: 'City of London',
    value: 'LND',
    region: 'central'
  }, {
    text: 'Croydon',
    value: 'CRY',
    region: 'south'
  }, {
    text: 'Ealing',
    value: 'EAL',
    region: 'west'
  }, {
    text: 'Enfield',
    value: 'ENF',
    region: 'north'
  }, {
    text: 'Greenwich',
    value: 'GRE',
    region: 'east'
  }, {
    text: 'Hackney',
    value: 'HCK',
    region: 'east'
  }, {
    text: 'Hammersmith and Fulham',
    value: 'HMF',
    region: 'west'
  }, {
    text: 'Haringey',
    value: 'HRY',
    region: 'north'
  }, {
    text: 'Harrow',
    value: 'HRW',
    region: 'west'
  }, {
    text: 'Havering',
    value: 'HAV',
    region: 'east'
  }, {
    text: 'Hillingdon',
    value: 'HIL',
    region: 'west'
  }, {
    text: 'Hounslow',
    value: 'HNS',
    region: 'west'
  }, {
    text: 'Islington',
    value: 'ISL',
    region: 'central'
  }, {
    text: 'Kensington and Chelsea',
    value: 'KEC',
    region: 'central'
  }, {
    text: 'Kingston upon Thames',
    value: 'KTT',
    region: 'south'
  }, {
    text: 'Lambeth',
    value: 'LBH',
    region: 'central'
  }, {
    text: 'Lewisham',
    value: 'LEW',
    region: 'east'
  }, {
    text: 'Merton',
    value: 'MRT',
    region: 'south'
  }, {
    text: 'Newham',
    value: 'NWM',
    region: 'east'
  }, {
    text: 'Redbridge',
    value: 'RDB',
    region: 'east'
  }, {
    text: 'Richmond upon Thames',
    value: 'RIC',
    region: 'west'
  }, {
    text: 'Southwark',
    value: 'SWK',
    region: 'central'
  }, {
    text: 'Sutton',
    value: 'STN',
    region: 'south'
  }, {
    text: 'Tower Hamlets',
    value: 'TWH',
    region: 'east'
  }, {
    text: 'Waltham Forest',
    value: 'WFT',
    region: 'east'
  }, {
    text: 'Wandsworth',
    value: 'WND',
    region: 'south'
  }, {
    text: 'Westminster',
    value: 'WSM',
    region: 'central'
  }],
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
  entryRequirementOptions: [
    {
      text: '2:1 degree or higher',
      value: '21'
    },
    {
      text: '2:2 degree or higher',
      value: '22'
    },
    {
      text: 'Third class degree or higher',
      value: 'third'
    },
    {
      text: 'Any undergraduate degree',
      value: 'degree'
    }
  ],
  salaryOptions: [{
    text: 'Only show courses with a salary',
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
  subjectGroups: [{
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
    text: 'Design and technology',
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
    text: 'Only show courses with vacancies',
    value: ['include']
  }],
  areas: [{
    name: 'Andover',
    showOnHomepage: false
  }, {
    name: 'Ashford',
    showOnHomepage: false
  }, {
    name: 'Barnsley',
    showOnHomepage: false
  }, {
    name: 'Barnstaple',
    showOnHomepage: false
  }, {
    name: 'Barrow-in-Furness',
    showOnHomepage: false
  }, {
    name: 'Basingstoke',
    showOnHomepage: false
  }, {
    name: 'Bath',
    showOnHomepage: false
  }, {
    name: 'Bedford',
    showOnHomepage: false
  }, {
    name: 'Berwick',
    showOnHomepage: false
  }, {
    name: 'Bideford',
    showOnHomepage: false
  }, {
    name: 'Birkenhead',
    showOnHomepage: false
  }, {
    name: 'Birmingham',
    showOnHomepage: true
  }, {
    name: 'Blackburn',
    showOnHomepage: true
  }, {
    name: 'Blackpool',
    showOnHomepage: false
  }, {
    name: 'Blandford Forum and Gillingham',
    showOnHomepage: false
  }, {
    name: 'Blyth and Ashington',
    showOnHomepage: false
  }, {
    name: 'Boston',
    showOnHomepage: false
  }, {
    name: 'Bournemouth',
    showOnHomepage: false
  }, {
    name: 'Bradford',
    showOnHomepage: true
  }, {
    name: 'Bridgwater',
    showOnHomepage: false
  }, {
    name: 'Bridlington',
    showOnHomepage: false
  }, {
    name: 'Bridport',
    showOnHomepage: false
  }, {
    name: 'Brighton',
    showOnHomepage: true
  }, {
    name: 'Bristol',
    showOnHomepage: true
  }, {
    name: 'Bude',
    showOnHomepage: false
  }, {
    name: 'Burnley',
    showOnHomepage: false
  }, {
    name: 'Burton upon Trent',
    showOnHomepage: false
  }, {
    name: 'Bury St Edmunds',
    showOnHomepage: false
  }, {
    name: 'Buxton',
    showOnHomepage: false
  }, {
    name: 'Cambridge',
    showOnHomepage: true
  }, {
    name: 'Canterbury',
    showOnHomepage: false
  }, {
    name: 'Carlisle',
    showOnHomepage: false
  }, {
    name: 'Chelmsford',
    showOnHomepage: false
  }, {
    name: 'Cheltenham',
    showOnHomepage: false
  }, {
    name: 'Chester',
    showOnHomepage: false
  }, {
    name: 'Chesterfield',
    showOnHomepage: false
  }, {
    name: 'Chichester and Bognor Regis',
    showOnHomepage: false
  }, {
    name: 'Cinderford and Ross-on-Wye',
    showOnHomepage: false
  }, {
    name: 'Clacton',
    showOnHomepage: false
  }, {
    name: 'Colchester',
    showOnHomepage: false
  }, {
    name: 'Corby',
    showOnHomepage: false
  }, {
    name: 'Coventry',
    showOnHomepage: true
  }, {
    name: 'Crawley',
    showOnHomepage: false
  }, {
    name: 'Crewe',
    showOnHomepage: false
  }, {
    name: 'Cromer and Sheringham',
    showOnHomepage: false
  }, {
    name: 'Darlington',
    showOnHomepage: false
  }, {
    name: 'Derby',
    showOnHomepage: true
  }, {
    name: 'Doncaster',
    showOnHomepage: true
  }, {
    name: 'Dorchester and Weymouth',
    showOnHomepage: false
  }, {
    name: 'Dudley',
    showOnHomepage: false
  }, {
    name: 'Durham and Bishop Auckland',
    showOnHomepage: false
  }, {
    name: 'Eastbourne',
    showOnHomepage: true
  }, {
    name: 'Evesham',
    showOnHomepage: false
  }, {
    name: 'Exeter',
    showOnHomepage: false
  }, {
    name: 'Falmouth',
    showOnHomepage: false
  }, {
    name: 'Folkestone and Dover',
    showOnHomepage: false
  }, {
    name: 'Gloucester',
    showOnHomepage: false
  }, {
    name: 'Grantham',
    showOnHomepage: false
  }, {
    name: 'Great Yarmouth',
    showOnHomepage: false
  }, {
    name: 'Grimsby',
    showOnHomepage: false
  }, {
    name: 'Guildford and Aldershot',
    showOnHomepage: false
  }, {
    name: 'Halifax',
    showOnHomepage: false
  }, {
    name: 'Harrogate',
    showOnHomepage: false
  }, {
    name: 'Hartlepool',
    showOnHomepage: false
  }, {
    name: 'Hastings',
    showOnHomepage: false
  }, {
    name: 'Hereford',
    showOnHomepage: false
  }, {
    name: 'Hexham',
    showOnHomepage: false
  }, {
    name: 'High Wycombe and Aylesbury',
    showOnHomepage: false
  }, {
    name: 'Huddersfield',
    showOnHomepage: false
  }, {
    name: 'Hull',
    showOnHomepage: true
  }, {
    name: 'Huntingdon',
    showOnHomepage: false
  }, {
    name: 'Ipswich',
    showOnHomepage: false
  }, {
    name: 'Isle of Wight',
    showOnHomepage: false
  }, {
    name: 'Kendal',
    showOnHomepage: false
  }, {
    name: 'Kettering and Wellingborough',
    showOnHomepage: false
  }, {
    name: 'King’s Lynn',
    showOnHomepage: false
  }, {
    name: 'Kingsbridge and Dartmouth',
    showOnHomepage: false
  }, {
    name: 'Lancaster and Morecambe',
    shortName: 'Lancaster',
    showOnHomepage: false
  }, {
    name: 'Launceston',
    showOnHomepage: false
  }, {
    name: 'Leamington Spa',
    showOnHomepage: false
  }, {
    name: 'Leeds',
    showOnHomepage: true
  }, {
    name: 'Leicester',
    showOnHomepage: true
  }, {
    name: 'Lincoln',
    showOnHomepage: true
  }, {
    name: 'Liskeard',
    showOnHomepage: false
  }, {
    name: 'Liverpool',
    showOnHomepage: true
  }, {
    name: 'London',
    showOnHomepage: true
  }, {
    name: 'Lowestoft',
    showOnHomepage: false
  }, {
    name: 'Ludlow',
    showOnHomepage: false
  }, {
    name: 'Luton',
    showOnHomepage: false
  }, {
    name: 'Malton',
    showOnHomepage: false
  }, {
    name: 'Manchester',
    showOnHomepage: true
  }, {
    name: 'Mansfield',
    showOnHomepage: false
  }, {
    name: 'Margate and Ramsgate',
    showOnHomepage: false
  }, {
    name: 'Medway',
    showOnHomepage: false
  }, {
    name: 'Middlesbrough and Stockton',
    shortName: 'Middlesbrough',
    showOnHomepage: true
  }, {
    name: 'Milton Keynes',
    showOnHomepage: false
  }, {
    name: 'Minehead',
    showOnHomepage: false
  }, {
    name: 'Newbury',
    showOnHomepage: false
  }, {
    name: 'Newcastle',
    showOnHomepage: true
  }, {
    name: 'Northallerton',
    showOnHomepage: false
  }, {
    name: 'Northampton',
    showOnHomepage: false
  }, {
    name: 'Norwich',
    showOnHomepage: true
  }, {
    name: 'Nottingham',
    showOnHomepage: true
  }, {
    name: 'Oswestry',
    showOnHomepage: false
  }, {
    name: 'Oxford',
    showOnHomepage: true
  }, {
    name: 'Pembroke and Tenby',
    showOnHomepage: false
  }, {
    name: 'Penrith',
    showOnHomepage: false
  }, {
    name: 'Penzance',
    showOnHomepage: false
  }, {
    name: 'Peterborough',
    showOnHomepage: false
  }, {
    name: 'Plymouth',
    showOnHomepage: false
  }, {
    name: 'Poole',
    showOnHomepage: false
  }, {
    name: 'Portsmouth',
    showOnHomepage: true
  }, {
    name: 'Preston',
    showOnHomepage: true
  }, {
    name: 'Reading',
    showOnHomepage: true
  }, {
    name: 'Redruth and Truro',
    showOnHomepage: false
  }, {
    name: 'Salisbury',
    showOnHomepage: false
  }, {
    name: 'Scarborough',
    showOnHomepage: false
  }, {
    name: 'Scunthorpe',
    showOnHomepage: false
  }, {
    name: 'Sheffield',
    showOnHomepage: true
  }, {
    name: 'Shrewsbury',
    showOnHomepage: false
  }, {
    name: 'Sidmouth',
    showOnHomepage: false
  }, {
    name: 'Skegness and Louth',
    showOnHomepage: false
  }, {
    name: 'Skipton',
    showOnHomepage: false
  }, {
    name: 'Slough and Heathrow Airport',
    shortName: 'Slough',
    showOnHomepage: false
  }, {
    name: 'Southampton',
    showOnHomepage: true
  }, {
    name: 'Southend',
    showOnHomepage: false
  }, {
    name: 'Spalding',
    showOnHomepage: false
  }, {
    name: 'St Austell and Newquay',
    showOnHomepage: false
  }, {
    name: 'Stafford',
    showOnHomepage: false
  }, {
    name: 'Stevenage and Welwyn Garden City',
    showOnHomepage: false
  }, {
    name: 'Stoke-on-Trent',
    showOnHomepage: true
  }, {
    name: 'Street and Wells',
    showOnHomepage: false
  }, {
    name: 'Sunderland',
    showOnHomepage: true
  }, {
    name: 'Swindon',
    showOnHomepage: false
  }, {
    name: 'Taunton',
    showOnHomepage: false
  }, {
    name: 'Telford',
    showOnHomepage: false
  }, {
    name: 'Thetford and Mildenhall',
    showOnHomepage: false
  }, {
    name: 'Torquay and Paignton',
    showOnHomepage: false
  }, {
    name: 'Trowbridge',
    showOnHomepage: false
  }, {
    name: 'Tunbridge Wells',
    showOnHomepage: false
  }, {
    name: 'Wadebridge',
    showOnHomepage: false
  }, {
    name: 'Wakefield and Castleford',
    showOnHomepage: false
  }, {
    name: 'Warrington and Wigan',
    showOnHomepage: false
  }, {
    name: 'Weston-super-Mare',
    showOnHomepage: false
  }, {
    name: 'Whitby',
    showOnHomepage: false
  }, {
    name: 'Whitehaven',
    showOnHomepage: false
  }, {
    name: 'Wisbech',
    showOnHomepage: false
  }, {
    name: 'Wolverhampton and Walsall',
    showOnHomepage: false
  }, {
    name: 'Worcester and Kidderminster',
    showOnHomepage: false
  }, {
    name: 'Workington',
    showOnHomepage: false
  }, {
    name: 'Worksop and Retford',
    showOnHomepage: false
  }, {
    name: 'Worthing',
    showOnHomepage: false
  }, {
    name: 'Yeovil',
    showOnHomepage: false
  }, {
    name: 'York',
    showOnHomepage: true
  }]
}

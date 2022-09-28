module.exports = {
  apiEndpoint: 'https://api.publish-teacher-training-courses.service.gov.uk/api/public/v1',
  cycle: 2022,
  nearingEndOfCycle: false,
  defaults: {
    latitude: false,
    longitude: false,
    radius: 50,
    qualification_: ['qts', 'pgce_with_qts,pgde_with_qts', 'pgce,pgde'],
    qualification: ['qts','pgce_with_qts','pgde_with_qts'],
    fundingType: 'salary,apprenticeship,fee',
    send: ['exclude'],
    studyMode: ['full_time', 'part_time'],
    subject: [],
    vacancy: ['include'],
    degreeGrade: ['two_one'],
    visaSponsorship: ['exclude'],
    campaign: ['exclude']
  }
}

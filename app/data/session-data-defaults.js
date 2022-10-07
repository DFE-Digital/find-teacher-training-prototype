module.exports = {
  apiEndpoint: 'https://api.publish-teacher-training-courses.service.gov.uk/api/public/v1',
  cycle: 2023,
  nearingEndOfCycle: false,
  cycleClosed: false,
  defaults: {
    latitude: false,
    longitude: false,
    radius: 50,
    qualification: ['qts','pgce_with_qts','pgde_with_qts','pgce','pgde'],
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

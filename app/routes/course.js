const got = require('got')

module.exports = router => {
  router.get('/course/:providerCode/:courseCode', async (req, res) => {
    const { providerCode, courseCode } = req.params
    const { apiEndpoint, cycle } = req.session.data

    try {
      const { data, included } = await got(`${apiEndpoint}/recruitment_cycles/${cycle}/providers/${providerCode}/courses/${courseCode}?include=provider`).json()

      const course = data.attributes

      let provider = included.find(item => item.type === 'providers')
      provider = provider.attributes

      // Email and website address
      provider.website = provider.website ? `http://${provider.website.replace(/^https?:\/\//, '')}` : false
      provider.domain = new URL(provider.website).hostname
      provider.email = provider.email ? provider.email : `enquiries@${provider.domain}`
      provider.telephone = provider.telephone ? provider.telephone : '01234 567890'

      // Length
      switch (course.course_length) {
        case 'OneYear':
          course.length = '1 year'
          break
        case 'TwoYears':
          course.length = 'Up to 2 years'
          break
        default:
          course.length = course.course_length
      }

      // Funding
      course.has_fees = course.funding_type === 'fee'
      course.salaried = course.funding_type === 'salary' || course.funding_type === 'apprenticeship'
      course.funding_option = course.salaried ? 'Salary' : 'Student finance if you’re eligible'
      course.has_bursary = course.name.includes('Chemistry') // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L47
      course.has_scholarship = true // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L59
      course.bursary_only = course.has_bursary && !course.has_scholarship
      course.has_scholarship_and_bursary = course.has_bursary && course.has_scholarship

      // Year range
      course.year_range = `${cycle} to ${Number(cycle) + 1}`

      res.render('course', { course, provider })
    } catch (error) {
      res.render('error', {
        title: error.name,
        content: error.message
      })
    }
  })
}

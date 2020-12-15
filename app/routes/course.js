const got = require('got')
const endpoint = process.env.TEACHER_TRAINING_API_URL
const cycle = process.env.RECRUITMENT_CYCLE

module.exports = router => {
  router.get('/course/:providerCode/:courseCode', async function (req, res) {
    const { providerCode, courseCode } = req.params

    try {
      const { body } = await got(`${endpoint}/recruitment_cycles/${cycle}/providers/${providerCode}/courses/${courseCode}?include=provider`, {
        responseType: 'json'
      })

      const { data, included } = body

      const course = data.attributes
      let provider = included.find(item => item.type === 'providers')
      provider = provider.attributes

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

      res.render('course', { course, provider })
    } catch (error) {
      console.error(error.response.body)
    }
  })
}

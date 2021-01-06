const teacherTrainingModel = require('../models/teacher-training')

module.exports = router => {
  router.get('/course/:providerCode/:courseCode', async (req, res) => {
    const { providerCode, courseCode } = req.params

    try {
      const course = await teacherTrainingModel.getCourse(providerCode, courseCode)
      res.render('course', { course })
    } catch (error) {
      res.render('error', {
        title: error.name,
        content: error.message
      })
    }
  })
}

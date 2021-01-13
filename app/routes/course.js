const teacherTrainingModel = require('../models/teacher-training')
const utils = require('../utils')()

module.exports = router => {
  router.get('/course/:providerCode/:courseCode', async (req, res) => {
    const { providerCode, courseCode } = req.params

    try {
      const course = await teacherTrainingModel.getCourse(providerCode, courseCode)

      // Get travel areas that school placements lie within
      const placementAreas = await utils.getPlacementAreas(providerCode, courseCode)

      res.render('course', { course, placementAreas })
    } catch (error) {
      res.render('error', {
        title: error.name,
        content: error.message
      })
    }
  })
}

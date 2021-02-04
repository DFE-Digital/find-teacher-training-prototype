const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

module.exports = router => {
  router.get('/course/:providerCode/:courseCode', async (req, res) => {
    const { providerCode, courseCode } = req.params

    try {
      const courseSingleResponse = await teacherTrainingService.getCourse(providerCode, courseCode)
      const course = utils.decorateCourse(courseSingleResponse.data.attributes)

      // Get travel areas that school placements lie within
      // Fake it by adding current travel area being to list of placements
      const fakedPlacementArea = req.session.data.area ? req.session.data.area.name : false
      const placementAreas = await utils.getPlacementAreas(providerCode, courseCode, fakedPlacementArea)

      res.render('course', { course, placementAreas })
    } catch (error) {
      res.render('error', {
        title: error.name,
        content: error.message
      })
    }
  })
}

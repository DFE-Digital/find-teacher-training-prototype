const express = require('express')
const router = express.Router()

// Controller modules
const courseController = require('./controllers/courses')
const resultsController = require('./controllers/results')
const searchController = require('./controllers/search')

/// ------------------------------------------------------------------------ ///
/// SEARCH ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/', async (req, res) => {
  res.render('start')
})

router.get('/search', searchController.search_get)
router.post('/search', searchController.search_post)

router.get('/age-groups', searchController.age_groups_get)
router.post('/age-groups', searchController.age_groups_post)

// router.get('/primary', searchController.primary_get)
// router.post('/primary', searchController.primary_post)

router.get('/primary-subjects', searchController.primary_subjects_get)
router.post('/primary-subjects', searchController.primary_subjects_post)

router.get('/secondary-subjects', searchController.secondary_subjects_get)
router.post('/secondary-subjects', searchController.secondary_subjects_post)

/// ------------------------------------------------------------------------ ///
/// RESULTS ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/results', resultsController.results_get)
router.post('/results', resultsController.results_post)

/// ------------------------------------------------------------------------ ///
/// COURSES ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/course/:providerCode/:courseCode', courseController.show)

/// ------------------------------------------------------------------------ ///
/// PROTOTYPE ADMIN
/// ------------------------------------------------------------------------ ///

router.get('/admin/clear-data', (req, res) => {
  delete req.session.data
  res.redirect('/')
})

/// ------------------------------------------------------------------------ ///
/// END
/// ------------------------------------------------------------------------ ///
module.exports = router

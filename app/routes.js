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
  res.render('index')
})

router.all('/search', searchController.search)

router.get('/age-group', searchController.age_group_get)
router.post('/age-group', searchController.age_group_post)

router.get('/primary', searchController.primary_get)
router.post('/primary', searchController.primary_post)

router.get('/primary-specialist-subject', searchController.primary_specialist_subject_get)

router.get('/subject', searchController.subject_get)

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

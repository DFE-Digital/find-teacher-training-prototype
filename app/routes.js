const express = require('express')
const router = express.Router()

// Controller modules
const browseController = require('./controllers/browse')
const courseController = require('./controllers/courses')
const resultsController = require('./controllers/results')
const searchController = require('./controllers/search')

const checkHasSearchParams = (req, res, next) => {
  if (!req.session.data.subjects) {
    res.redirect('/')
  } else {
    next()
  }
}

/// ------------------------------------------------------------------------ ///
/// ALL ROUTES
/// ------------------------------------------------------------------------ ///
router.all('*', (req, res, next) => {
  res.locals.referrer = req.query.referrer
  res.locals.query = req.query
  res.locals.userJourney = process.env.USER_JOURNEY
  next()
})

router.get('/', async (req, res) => {
  if (process.env.SHOW_START_PAGE === 'true') {
    res.render('start')
  } else {
    if (process.env.USER_JOURNEY === 'browse') {
      res.redirect('/browse')
    } else {
      res.redirect('/search')
    }
  }
})

/// ------------------------------------------------------------------------ ///
/// BROWSE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/browse', browseController.browse_get)

router.get('/browse/primary', browseController.primary_get)
router.get('/browse/primary-all-england', browseController.primary_all_england_get)

router.get('/browse/secondary', browseController.secondary_get)
router.get('/browse/secondary-all-england', browseController.secondary_all_england_get)

router.get('/browse/location', browseController.location_get)
router.post('/browse/location', browseController.location_post)

/// ------------------------------------------------------------------------ ///
/// SEARCH ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/search', searchController.search_get)
router.post('/search', searchController.search_post)

router.get('/age-groups', searchController.age_groups_get)
router.post('/age-groups', searchController.age_groups_post)

router.get('/primary-subjects', searchController.primary_subjects_get)
router.post('/primary-subjects', searchController.primary_subjects_post)

router.get('/secondary-subjects', searchController.secondary_subjects_get)
router.post('/secondary-subjects', searchController.secondary_subjects_post)

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/location-suggestions', searchController.location_suggestions_json)

router.get('/provider-suggestions', searchController.provider_suggestions_json)

/// ------------------------------------------------------------------------ ///
/// RESULTS ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/results', checkHasSearchParams, resultsController.results_get)
router.post('/results', checkHasSearchParams, resultsController.results_post)

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

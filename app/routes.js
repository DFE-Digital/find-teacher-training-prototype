const express = require('express')
const router = express.Router()

// Controller modules
const browseController = require('./controllers/browse')
const courseController = require('./controllers/courses')
const resultsController = require('./controllers/results')
const searchController = require('./controllers/search')

const checkHasSearchParams = (req, res, next) => {
  if (!req.session.data.filter?.subject) {
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


router.get('/browse/further-education-all-england', browseController.further_education_all_england_get)

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

router.get('/results', resultsController.list)

router.get('/results/remove-keyword-search', resultsController.removeKeywordSearch)

router.get('/results/remove-subject-filter/:subject', resultsController.removeSubjectFilter)
router.get('/results/remove-send-filter/:send', resultsController.removeSendFilter)
router.get('/results/remove-vacancy-filter/:vacancy', resultsController.removeVacancyFilter)
router.get('/results/remove-study-mode-filter/:studyMode', resultsController.removeStudyModeFilter)
router.get('/results/remove-qualification-filter/:qualification', resultsController.removeQualificationFilter)
router.get('/results/remove-degree-grade-filter/:degreeGrade', resultsController.removeDegreeGradeFilter)
router.get('/results/remove-visa-sponsorship-filter/:visaSponsorship', resultsController.removeVisaSponsorshipFilter)
router.get('/results/remove-funding-type-filter/:fundingType', resultsController.removeFundingTypeFilter)
router.get('/results/remove-campaign-filter/:fundingType', resultsController.removeCampaignFilter)

router.get('/results/remove-all-filters', resultsController.removeAllFilters)


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

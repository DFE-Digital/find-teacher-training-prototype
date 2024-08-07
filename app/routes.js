const express = require('express')
const router = express.Router()

// Controller modules
const browseController = require('./controllers/browse')
const courseController = require('./controllers/courses')
const providerController = require('./controllers/providers')
const resultsController = require('./controllers/results')
const searchController = require('./controllers/search')


const questionController = require('./controllers/hackday/questions')

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
  // if (process.env.SHOW_START_PAGE === 'true') {
  //   res.render('start')
  // } else {
    if (process.env.USER_JOURNEY === 'browse') {
      res.redirect('/browse')
    } else if (process.env.USER_JOURNEY === 'filter') {
      res.redirect('/results')
    } else {
      res.render('./index')
    }
  // }
})

// router.get('/home', (req, res) => {
//   res.render('./index')
// })

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

router.get('/:version/search', searchController.search_get)
router.post('/:version/search', searchController.search_post)

router.get('/:version/age-groups', searchController.age_groups_get)
router.post('/:version/age-groups', searchController.age_groups_post)

router.get('/:version/primary-subjects', searchController.primary_subjects_get)
router.post('/:version/primary-subjects', searchController.primary_subjects_post)

router.get('/:version/secondary-subjects', searchController.secondary_subjects_get)
router.post('/:version/secondary-subjects', searchController.secondary_subjects_post)

router.get('/:version/visa-sponsorship', searchController.visa_sponsorship_get)
router.post('/:version/visa-sponsorship', searchController.visa_sponsorship_post)

/// ------------------------------------------------------------------------ ///
/// RESULTS ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/:version/closed', resultsController.closed)

router.get('/:version/results', resultsController.list)

router.get('/:version/results/remove-keyword-search', resultsController.removeKeywordSearch)

router.get('/:version/results/remove-campaign-filter/:campaign', resultsController.removeCampaignFilter)
router.get('/:version/results/remove-degree-grade-filter/:degreeGrade', resultsController.removeDegreeGradeFilter)
router.get('/:version/results/remove-funding-type-filter/:fundingType', resultsController.removeFundingTypeFilter)
router.get('/:version/results/remove-provider-type-filter/:providerType', resultsController.removeProviderTypeFilter)
router.get('/:version/results/remove-qualification-filter/:qualification', resultsController.removeQualificationFilter)
router.get('/:version/results/remove-send-filter/:send', resultsController.removeSendFilter)
router.get('/:version/results/remove-study-mode-filter/:studyMode', resultsController.removeStudyModeFilter)
router.get('/:version/results/remove-subject-filter/:subject', resultsController.removeSubjectFilter)
router.get('/:version/results/remove-vacancy-filter/:vacancy', resultsController.removeVacancyFilter)
router.get('/:version/results/remove-visa-sponsorship-filter/:visaSponsorship', resultsController.removeVisaSponsorshipFilter)

router.get('/results/remove-all-filters', resultsController.removeAllFilters)

/// ------------------------------------------------------------------------ ///
/// AUTOCOMPLETE ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/location-suggestions', searchController.location_suggestions_json)

router.get('/provider-suggestions', searchController.provider_suggestions_json)

/// ------------------------------------------------------------------------ ///
/// PROVIDER ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/providers/remove-accredited-body-filter/:ageGroup', providerController.removeAccreditedBodyFilter)
router.get('/providers/remove-age-group-filter/:ageGroup', providerController.removeAgeGroupFilter)
router.get('/providers/remove-funding-type-filter/:fundingType', providerController.removeFundingTypeFilter)
router.get('/providers/remove-provider-type-filter/:providerType', providerController.removeProviderTypeFilter)
router.get('/providers/remove-region-filter/:region', providerController.removeRegionFilter)
router.get('/providers/remove-send-filter/:send', providerController.removeSendFilter)
router.get('/providers/remove-visa-sponsorship-filter/:visaSponsorship', providerController.removeVisaSponsorshipFilter)

router.get('/providers/remove-all-filters', providerController.removeAllFilters)
router.get('/providers/remove-keyword-search', providerController.removeKeywordSearch)

router.get('/providers/:providerCode', providerController.show)

router.get('/providers', providerController.list)

/// ------------------------------------------------------------------------ ///
/// COURSES ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/:version/providers/:providerCode/courses/:courseCode/about-provider', courseController.showProvider)

router.get('/:version/providers/:providerCode/courses/:courseCode/about-accredited', courseController.showAccreditedProvider)

router.get('/:version/providers/:providerCode/courses/:courseCode/training-with-disabilities', courseController.showTrainingWithDisabilities)

router.get('/:version/providers/:providerCode/courses/:courseCode/school-placements', courseController.showSchoolPlacements)

router.get('/:version/providers/:providerCode/courses/:courseCode', courseController.show)

router.get('/:version/course/:providerCode/:courseCode', courseController.show)

/// ------------------------------------------------------------------------ ///
/// HACKDAY ROUTES
/// ------------------------------------------------------------------------ ///

router.get('/hackday', (req, res) => {
  res.render('./hackday/index')
})

// Compare

router.get('/hackday/compare', (req, res) => {
  res.render('./hackday/compare/index')
})

router.get('/hackday/compare-empty', (req, res) => {
  res.render('./hackday/compare/empty')
})

router.get('/hackday/compare-partial', (req, res) => {
  res.render('./hackday/compare/partial')
})

// Saved

router.get('/hackday/saved', (req, res) => {
  res.render('./hackday/account/saved/index')
})

router.get('/hackday/saved-empty', (req, res) => {
  res.render('./hackday/account/saved/empty')
})

router.get('/hackday/saved-partial', (req, res) => {
  res.render('./hackday/account/saved/partial')
})

// Account

router.get('/hackday/account', (req, res) => {
  res.render('./hackday/account/index')
})

// Courses

router.get('/hackday/course/:courseId', (req, res) => {
  res.render('./hackday/courses/index')
})

router.get('/hackday/partner/:partnerId', (req, res) => {
  res.render('./hackday/partners/index')
})

// New question flow

router.get('/hackday/questions', (req, res) => {
  res.redirect('/hackday/questions/location-or-provider')
})

// router.get('/hackday/questions/:questionId', questionController.question_get)
// router.post('/hackday/questions/:questionId', questionController.question_post)

router.get('/hackday/questions/location-or-provider', questionController.location_or_provider_get)
router.post('/hackday/questions/location-or-provider', questionController.location_or_provider_post)

router.get('/hackday/questions/subject-level', questionController.subject_level_get)
router.post('/hackday/questions/subject-level', questionController.subject_level_post)

router.get('/hackday/questions/primary-subject', questionController.primary_subject_get)
router.post('/hackday/questions/primary_subject', questionController.primary_subject_post)

router.get('/hackday/questions/secondary-subject', questionController.secondary_subject_get)
router.post('/hackday/questions/secondary-subject', questionController.secondary_subject_post)

router.get('/hackday/questions/interstitial', questionController.interstitial_get)

router.get('/hackday/questions/nationality', questionController.nationality_get)
router.post('/hackday/questions/nationality', questionController.nationality_post)

router.get('/hackday/questions/right-to-work-or-study', questionController.right_to_work_or_study_get)
router.post('/hackday/questions/right-to-work-or-study', questionController.right_to_work_or_study_post)

router.get('/hackday/questions/degree-grade', questionController.degree_grade_get)
router.post('/hackday/questions/degree-grade', questionController.degree_grade_post)

/// ------------------------------------------------------------------------ ///
/// PRE-FILTERING 2024
/// ------------------------------------------------------------------------ ///

router.get('/pre-filtering-2024', (req, res) => {
  res.render('./pre-filtering-2024/index')
})

router.get('/subject', (req, res) => {
  res.render('./pre-filtering-2024/subject')
})

router.get('/subject-fund', (req, res) => {
  res.render('./pre-filtering-2024/subject-fund')
})

router.get('/subject-half', (req, res) => {
  res.render('./pre-filtering-2024/subject-half')
})

/// ------------------------------------------------------------------------ ///
/// PROTOTYPE ADMIN
/// ------------------------------------------------------------------------ ///

router.get('/admin/clear-data', (req, res) => {
  delete req.session.data
  res.redirect('/')
})

/// ------------------------------------------------------------------------ ///
/// ERRORS
/// ------------------------------------------------------------------------ ///

// page not found - 404
// https://design-system.service.gov.uk/patterns/page-not-found-pages/
router.get('/404', (req, res) => {
  res.render('./404')
})

// internal server error - 500
// https://design-system.service.gov.uk/patterns/problem-with-the-service-pages/
router.get('/500', (req, res) => {
  res.render('./500')
})

// service unavailable
// https://design-system.service.gov.uk/patterns/service-unavailable-pages/
router.get('/503', (req, res) => {
  res.render('./503')
})

// page not found
router.get('*', (req, res) => {
  res.render('./404')
})

/// ------------------------------------------------------------------------ ///
/// END
/// ------------------------------------------------------------------------ ///
module.exports = router

var express = require('express')
var router = express.Router()
var geolib = require('geolib')

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// Route index page
router.post('/', function (req, res) {
  res.render('index')
})

// Route index page
router.get('/course/:providerCode/:courseCode', function (req, res) {
  var course = req.session.data['courses'].find(function(c) {
    return c.programmeCode == req.params.courseCode;
  });

  res.render('course', { course: course });
})

// Route index page
router.get('/results', function (req, res) {
  var paginated = false;
  var phase = "Secondary";
  var subjects = req.session.data['selectedSubjects'];

  // Find by subject
  var results = req.session.data['courses'].filter(function(course) {
    return course.subjects.includes(phase) && course.subjects.some(r => subjects.indexOf(r) >= 0)
  });

  // Find by type
  if (req.session.data['study-type'].length == 1) {
    var type = req.session.data['study-type'].join(' ').includes('Part') ? 'part time' : 'full time';

    results = results.filter(function(course) {
      return course.options.some(o => o.includes(type))
    });
  }

  // Find by qualification
  if (req.session.data['qualification'].length == 1) {
    var qualification = req.session.data['qualification'].join(' ').includes('Postgraduate') ? 'PGCE with' : 'QTS';
    results = results.filter(function(course) {
      return course.options.some(o => o.startsWith(qualification))
    });
  }

  // Sort by location
  var london = {latitude: 51.508530, longitude: -0.076132};

  results.forEach(function(course) {
    var latLong = { latitude: course.addresses[0].latitude, longitude: course.addresses[0].longitude };
    var d = geolib.getDistanceSimple(london, latLong);
    course.distance = (d / 1000).toFixed(0);
  });

  results.sort(function(c1, c2) {
    return c1.distance - c2.distance;
  });

  var originalCount = results.length;

  if (results.length > 10) {
    results.length = 10;
    paginated = true;
  }

  res.render('results/index', { results: results, paginated: paginated, count: originalCount });
})

router.get('/results/filters/funding', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/funding', { 'backLink': backLink, 'filtering': true });
});

router.get('/results/filters/location', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/location', { 'backLink': backLink, 'filtering': true });
});

module.exports = router

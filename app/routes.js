var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  var subject = req.params.subject;
  if (subject) {
    req.session.data['subject'] = subject;
  }

  res.render('index')

  // While the prototype is not being used as a prototype:
  //res.redirect('/history')
})

// Route index page
router.post('/', function (req, res) {
  res.render('index')
})

// Route index page
router.get('/course/:id', function (req, res) {
  var course = req.session.data['results'].find(function(result) {
    return result.id == req.params.id;
  });

  res.render('courses/index', { course: course });
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
    console.log(qualification);

    results = results.filter(function(course) {
      return course.options.some(o => o.startsWith(qualification))
    });
  }

  if (results.length > 10) {
    results.length = 10;
    paginated = true;
  }

  res.render('results/index', { results: results, paginated: paginated });
})

router.get('/results/filters/funding', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/funding', { 'backLink': backLink, 'filtering': true });
});

router.get('/results/filters/location', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/location', { 'backLink': backLink, 'filtering': true });
});

// add your routes here

router.get('/v04/q3', function(req, res) {
    res.render('v04/q3', req.query);
});

module.exports = router

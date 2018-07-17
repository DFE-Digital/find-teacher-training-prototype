var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
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

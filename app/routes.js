var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

router.get('/results/filters/funding', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/funding', { 'backLink': backLink });
});

// add your routes here

router.get('/v04/q3', function(req, res) {
    res.render('v04/q3', req.query);
});

module.exports = router

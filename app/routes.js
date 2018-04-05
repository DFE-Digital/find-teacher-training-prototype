var express = require('express')
var router = express.Router()

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// add your routes here

router.get('/v04/q3', function(req, res) {
    res.render('v04/q3', req.query);
});

module.exports = router

var express = require('express')
var router = express.Router()
var geolib = require('geolib')
var geocoder = require('google-geocoder')
var geo = geocoder({ key: process.env.GOOGLE_API_KEY })

// geo.find('223 Edenbridge Dr, Toronto', function(err, res){
//   console.log(err);
//   console.log(res[0].location);
// });

// Route index page
router.get('/', function (req, res) {
  res.render('index')
})

// Route index page
router.post('/', function (req, res) {
  res.render('index')
})

//
router.post('/start/location', function (req, res) {
  var location = req.body['postcode-town-or-city'];
  var originalRes = res;

  if (location) {
    geo.find(location + ', UK', function(err, res) {
      if (err) {
        console.log(err);
        originalRes.render('start/location', {error: err});
      } else if (res.length == 0) {
        originalRes.render('start/location', {error: 'Sorry, we couldn’t find that location'});
      } else {
        console.log(res[0]);
        req.session.data['latLong'] = res[0].location;
        req.session.data['formattedAddress'] = res[0].formatted_address;
        originalRes.redirect('/results');
      }
    });
  } else {
    originalRes.redirect('/results');
  }
})

// Route index page
router.get('/course/:providerCode/:courseCode', function (req, res) {
  var course = req.session.data['courses'].find(function(c) {
    return c.programmeCode == req.params.courseCode;
  });

  res.render('course', { course: course });
})

router.get('/results/filters/subjects', function (req, res) {
  var subjects = [];

  req.session.data['subjects'].forEach(function(s) {
    subjects.push({name: s});
  });

  res.render('results/filters/subjects', { subjects: subjects });
})

// Route index page
router.get('/results', function (req, res) {
  if (req.session.data['location'] == 'School, university or other training provider') {
    res.render('start/location', {error: 'Searching by training provider isn’t available in this prototype.'});
    return;
  }

  var paginated = false;
  var phase = "Secondary";
  var subjects = req.session.data['selectedSubjects'];

  if (req.session.data['selectedSubjects'].some(s => s.match(/primary/i))) {
    phase = "Primary";
  }

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

  if (req.session.data['location'] == 'Across England') {
    results.sort(function(c1, c2) {
      return c1.provider.toLowerCase().localeCompare(c2.provider.toLowerCase());
    });
  } else {
    // Sort by location
    var savedLatLong = req.session.data['latLong'] || {latitude: 51.508530, longitude: -0.076132};

    results.forEach(function(course) {
      var latLong = { latitude: course.addresses[0].latitude, longitude: course.addresses[0].longitude };
      var d = geolib.getDistanceSimple(savedLatLong, latLong);
      course.distance = (d / 1000).toFixed(0);
    });

    results.sort(function(c1, c2) {
      return c1.distance - c2.distance;
    });
  }

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

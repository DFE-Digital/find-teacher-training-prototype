var express = require('express')
var router = express.Router()
var geolib = require('geolib')
var geocoder = require('google-geocoder')
var geo = geocoder({ key: process.env.GOOGLE_API_KEY })
var fs = require('fs')

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

router.post('/start/location', function (req, res) {
  if (req.session.data['location'] == 'School, university or other training provider') {
    res.render('start/location', {error: 'Searching by training provider isn’t available in this prototype.'});
    return;
  }

  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/start/subjects');
})

router.get('/results/filters/location', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/location', { 'backLink': backLink, 'filtering': true });
});

router.post('/results/filters/location', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  handleLocationSearch(req.body['postcode-town-or-city'], req, res, '/results', { 'backLink': backLink, 'filtering': true });
});

function handleLocationSearch(location, req, res, successRedirect, options = {}) {
  if (location) {
    geo.find(location + ', UK', function(err, geoResponse) {
      if (err) {
        console.log(err);
        options.error = err;
        res.render('start/location', options);
      } else if (geoResponse.length == 0) {
        options.error = 'Sorry, we couldn’t find that location';
        res.render('start/location', options);
      } else {
        req.session.data['latLong'] = geoResponse[0].location;
        req.session.data['formattedAddress'] = geoResponse[0].formatted_address;
        res.redirect(successRedirect);
      }
    });
  } else {
    res.redirect(successRedirect);
  }
}

// Route index page
router.get('/course/:providerCode/:courseCode', function (req, res) {
  var course;

  fs.readFile(`lib/courses/course_${req.params.providerCode}_${req.params.courseCode}.json`, (err, data) => {
    if (err) throw err;
    course = JSON.parse(data);
    res.render('course', { course: course });
  });
})

router.get('/results/filters/subjects', function (req, res) {
  var backLink = { text: 'Back to results', href: '/results'}
  res.render('start/subjects', { subjectGroups: subjectGroups(req), filtering: true, backLink: backLink });
})

router.get('/start/subjects', function (req, res) {
  res.render('start/subjects', { subjectGroups: subjectGroups(req) });
})

function subjectGroups(req) {
  var subjectGroups = [];

  for (const subjectGroup of Object.keys(req.session.data['groupedSubjects'])) {
    var subjects = [];
    var scholarshipAndBursarySubjects = [
      'Chemistry',
      'Geography',
      'Physics',
      'Computer studies',
      'French',
      'Spanish',
      'German',
    ];

    var lowerBursarySubjects = [
      'Biology',
      'Classics'
    ];

    var englishBursarySubjects = [
      'English',
      'English language',
      'English literature'
    ];

    var humanitiesBursarySubjects = [
      'History',
      'Music',
      'Religious education'
    ];

    var skeSubjects = [
      'Mathematics',
      'Physics',
      'Languages',
      'French',
      'Spanish',
      'German',
      'Chemistry',
      'Computer studies',
      'Biology',
      'Geography',
      'English',
      'English language',
      'English literature',
      'Design and technology'
    ];

    req.session.data['groupedSubjects'][subjectGroup].forEach(function(subject) {
      var text = '';
      if (scholarshipAndBursarySubjects.includes(subject)) {
        text = 'Scholarships and bursaries up to £28,000 available.';
      } else if (englishBursarySubjects.includes(subject)) {
        text = 'Bursaries of £15,000 available.';
      } else if (lowerBursarySubjects.includes(subject)) {
        text = 'Bursaries of £26,000 available.';
      } else if (humanitiesBursarySubjects.includes(subject)) {
        text = 'Bursaries of up to £9,000 available.';
      } else if (subject.includes('Design and technology')) {
        text = 'Bursaries of up to £12,000 available.';
      } else if (subject.includes('Mathematics')) {
        text = 'Scholarships and bursaries up to £22,000 available with further early career payments up to £10,000.';
      }

      if (skeSubjects.includes(subject) || subject.includes('Design and technology')) {
        if (text) {
          text = text + "<br />"
        }
        text = text + "Subject knowledge enhancement (SKE) courses offered."
      }
      // TODO: Primary maths too (6,000)
      subjects.push({name: subject, text: text ? '<span style="display: inline-block; margin-top: 5px; margin-bottom: -10px">' + text + '</span>' : null});
    });

    subjectGroups.push({ group: subjectGroup, subjects: subjects });
  }

  return subjectGroups
}

// Route index page
router.get('/results', function (req, res) {
  var paginated = false;
  var phase = ["Secondary"];
  var subjects = req.session.data['selectedSubjects'];

  if (req.session.data['selectedSubjects'].some(s => s.match(/primary/i))) {
    phase.push("Primary");
  }

  // Find by subject
  var results = req.session.data['courses'].filter(function(course) {
    return course.subjects.some(r => phase.indexOf(r) >= 0) && course.subjects.some(r => subjects.indexOf(r) >= 0)
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
      var latLong = { latitude: course.providerAddress.latitude, longitude: course.providerAddress.longitude };
      var d = geolib.getDistanceSimple(savedLatLong, latLong);
      course.distance = (d / 1000).toFixed(0);
    });

    results.sort(function(c1, c2) {
      return c1.distance - c2.distance;
    });
  }

  var originalCount = results.length;

  if (results.length > 20) {
    results.length = 20;
    paginated = true;
  }

  res.render('results/index', { results: results, paginated: paginated, count: originalCount });
})

router.get('/results/filters/funding', function(req, res) {
  backLink = { text: 'Back to results', href: '/results'}
  res.render('start/funding', { 'backLink': backLink, 'filtering': true });
});

module.exports = router

// node scripts/screenshot-live.js 2018-05-08-live
var webshot = require('webshot');
var fs = require('fs');
var sharp = require('sharp');
var directoryName = process.argv.slice(-1)[0];

if (directoryName.startsWith('/Users')) {
  console.log('No arguments set');
  console.log('Please set a screenshot directory in the format 2018-XX-XX-name');
  return;
}

var directory = 'app/assets/images/history/' + directoryName;
var indexDirectory = 'app/views/history/' + directoryName;
if ( ! fs.existsSync(directory)){
  fs.mkdirSync(directory);
  fs.mkdirSync(directory + '/thumbnails');
}

if ( ! fs.existsSync(indexDirectory)){
  fs.mkdirSync(indexDirectory);
}

var options = {
  phantomConfig: {
    'ignore-ssl-errors': 'true'
  },
  windowSize: {
    width: 1200,
    height: 2000
  }
}

var paths = [
  { path: '/', name: 'index' },
  { path: '/disclaimer', name: 'disclaimer'},
  { path: '/start/location', name: 'choose-your-search'},
  { path: '/start/location?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&pgce=False&qts=False&fulltime=False&parttime=False', name: 'choose-your-search-location'},
  { path: '/start/location?l=3&subjects=2&query=University%20of%20Sussex&pgce=False&qts=False&fulltime=False&parttime=False', name: 'choose-your-search-provider'},
  { path: '/start/funding?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&pgce=False&qts=False&fulltime=False&parttime=False', name: 'financial-support'},
  { path: '/results?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=15&pgce=False&qts=False&fulltime=False&parttime=False', name: 'search-results'},
  { path: '/results?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False', name: 'search-results-none'},
  { path: '/course/62?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=15&pgce=False&qts=False&fulltime=False&parttime=False', name: 'course-details'},
  { path: '/results/filter/studytype?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False', name: 'study-type-filter'},
  { path: '/results/filter/qualification?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False', name: 'qualifications-filter'}
]

var template = '';

paths.forEach(function(item, index) {
  var i = index + 1;
  var indexStr = i < 10 ? '0' + i : i;
  var screenshot = directory + '/' + indexStr + '-' + item.name + '.png';
  var thumbnail = directory + '/thumbnails/' + indexStr + '-' + item.name + '.png';
  var heading = item.name.replace(/-/g, ' ');

  template += `
    <h2 class="heading-large" id="${item.name}">${heading.charAt(0).toUpperCase() + heading.slice(1)}</h2>
    <p>
      <a href="${screenshot.replace('app/assets', '/public')}">
        <img src="${thumbnail.replace('app/assets', '/public')}" />
      </a>
    </p>
  `

  webshot('https://find-postgraduate-teacher-training.education.gov.uk' + item.path, screenshot, options, function(err) {
    console.log(screenshot);
    sharp(screenshot).resize(500, null).toFile(thumbnail);
  });
});

var templateStart = `
{% extends "layout.html" %}
{% block page_title %}${directoryName}{% endblock %}

{% block content %}
<main id="content" role="main">
  <h1 class="heading-xlarge">${directoryName}</h1>
`;

var templateEnd = `
</main>
{% endblock %}
`;

fs.writeFile(indexDirectory + "/index.html", templateStart + template + templateEnd, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});

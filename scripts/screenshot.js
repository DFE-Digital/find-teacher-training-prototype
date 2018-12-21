// node scripts/screenshot.js directory-name-with-hyphens
var webshot = require('webshot');
var fs = require('fs');
var sharp = require('sharp');
var directoryName = process.argv.slice(-1)[0];

if (directoryName.startsWith('/Users')) {
  console.log('No arguments set');
  console.log('Please set a screenshot directory in the format directory-name-with-hyphens');
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
    height: 800
  },
  shotSize: {
    width: 'window',
    height: 'all'
  }
}

var paths = [
  { path: '/start/location?lat=50.82253&lng=-0.137163&rad=20&loc=Brighton,%20UK&lq=Brighton&l=1&sortby=2&qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'find-by-location'},
  { path: '/start/location?l=3&query=The%20University%20of%20Warwick&sortby=2&qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'find-by-location-provided-selected'},
  { path: '/start/subject?lat=50.82253&lng=-0.137163&rad=20&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=31,0,13,14&sortby=2&qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'find-by-subject'},
  { path: '/results?lat=50.82253&lng=-0.137163&rad=20&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=31,0,13,14&sortby=2&qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'search-results'},
  { path: '/results?subjects=14&funding=15&qualification=Other&fulltime=False&parttime=False', name: 'further-education-results'},
  { path: '/results/filter/studytype', name: 'study-type-filter'},
  { path: '/results/filter/qualification?qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'qualification-filter'},
  { path: '/results/filter/studytype', name: 'study-type-filter'},
  { path: '/results/filter/funding?qualification=QtsOnly&qualification=PgdePgceWithQts&qualification=Other&fulltime=False&parttime=False', name: 'salary-filter'},
  { path: '/results?funding=8&qualification=Other&fulltime=False&parttime=False', name: 'no-results'},
  { path: '/course/T92/X130', name: 'full-course-page'},
  { path: '/course/2DQ/34BZ', name: 'full-course-page-with-salary'},
  { path: '/course/L46/2NJR', name: 'full-course-page-pgde'},
  { path: '/course/2CG/2YXS', name: 'course-not-enriched'}
]

var template = '';
var contents = `
  {% set contents = [`;
var endContents = `
  ] %}
  {{ macros.screenshotContents(contents) }}
`;

paths.forEach(function(item, index) {
  var i = index + 1;
  var comma = index > 0 ? ', ': '';
  var indexStr = i < 10 ? '0' + i : i;
  var screenshot = directory + '/' + indexStr + '-' + item.name + '.png';
  var thumbnail = directory + '/thumbnails/' + indexStr + '-' + item.name + '.png';
  var heading = item.name.replace(/-/g, ' ');
  heading = heading.charAt(0).toUpperCase() + heading.slice(1)

  template += `
  {{ macros.screenshot('${heading}', '${item.name}', '${thumbnail.replace('app/assets', '/public')}', '${screenshot.replace('app/assets', '/public')}', '') }}
  `

  contents += `${comma}
    { text: '${heading}', id: '${item.name}' }`;

  webshot('https://find-postgraduate-teacher-training.education.gov.uk' + item.path, screenshot, options, function(err) {
    console.log(screenshot);
    sharp(screenshot).resize(630, null).toFile(thumbnail);
  });
});

var title = directoryName.replace(/-/g, ' ');
title = title.charAt(0).toUpperCase() + title.slice(1)

var templateStart = `{% extends "layout.html" %}
{% set title = '${title}' %}
{% block page_title %}{{ title }}{% endblock %}
{% block breadcrumbs %}{{ macros.designHistoryBreadcrumbs() }}{% endblock %}

{% block content %}
  <h1 class="govuk-heading-xl">{{ title }}</h1>
`;

var templateEnd = `{% endblock %}
`;

fs.writeFile(indexDirectory + "/index.html", templateStart + contents + endContents + template + templateEnd, function(err) {
  if (err) {
    return console.log(err);
  }
  console.log("The file was saved!");
});

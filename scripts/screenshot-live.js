// node scripts/screenshot-live.js 2018-05-08-live
var webshot = require('webshot');
var fs = require('fs');

var directoryName = process.argv.slice(-1)[0];

if (directoryName.startsWith('/Users')) {
  console.log('No arguments set');
  console.log('Please set a screenshot directory in the format 2018-XX-XX-name');
  return;
}

var directory = 'app/views/history/screenshots/' + directoryName;

if ( ! fs.existsSync(directory)){
  fs.mkdirSync(directory);
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
  '/',
  '/disclaimer',
  '/start/location',
  '/start/location?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&pgce=False&qts=False&fulltime=False&parttime=False',
  '/start/location?l=3&subjects=2&query=University%20of%20Sussex&pgce=False&qts=False&fulltime=False&parttime=False',
  '/start/funding?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&pgce=False&qts=False&fulltime=False&parttime=False',
  '/results?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=15&pgce=False&qts=False&fulltime=False&parttime=False',
  '/results?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False',
  '/course/62?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=15&pgce=False&qts=False&fulltime=False&parttime=False',
  '/results/filter/studytype?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False',
  '/results/filter/qualification?lat=50.82253&lng=-0.137163&rad=5&loc=Brighton,%20UK&lq=Brighton,%20UK&l=1&subjects=2&sortby=2&funding=14&pgce=False&qts=False&fulltime=False&parttime=False'
]

paths.forEach(function(path, index) {
  var i = index + 1;
  var indexStr = i < 10 ? '0' + i : i;
  webshot('https://find-postgraduate-teacher-training.education.gov.uk' + path, directory + '/' + directoryName + '-' + indexStr + '.png', options, function(err) {
    console.log(path);
  });
});

// Generate a page from pre-existing screenshots with filenames in format 00-some-name.png
// node scripts/generate.js directory-name-with-hyphens
var fs = require('fs');
var sharp = require('sharp');
var directoryName = process.argv.slice(-1)[0];

if (directoryName.startsWith('/Users')) {
  console.log('No arguments set');
  console.log('Please set a directory in the format directory-name-with-hyphens');
  return;
}

var directory = 'app/assets/images/history/' + directoryName;
var indexDirectory = 'app/views/history/' + directoryName;

if ( ! fs.existsSync(directory + '/thumbnails')){
  fs.mkdirSync(directory + '/thumbnails');
}

if ( ! fs.existsSync(indexDirectory)){
  fs.mkdirSync(indexDirectory);
}

var template = '';

fs.readdir(directory, (err, files) => {
  files.forEach(file => {
    if (!(/^\d{2}/.test(file) && /\.png$/.test(file))) {
      console.log('Ignoring: ' + file);
      return;
    }

    var screenshot = directory + '/' + file;
    var thumbnail = directory + '/thumbnails/' + file;

    // 01-name.png
    var name = file.replace(/^\d{2}-/, '').replace(/\.png$/, '');
    var heading = name.replace(/-/g, ' ');
    heading = heading.charAt(0).toUpperCase() + heading.slice(1)

    template += `
{{ macros.screenshot('${heading}', '${name}', '${thumbnail.replace('app/assets', '/public')}', '${screenshot.replace('app/assets', '/public')}', '') }}
`
    sharp(screenshot).resize(630, null).toFile(thumbnail);
  });

  var title = directoryName.replace(/-/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1)

  var templateStart = `{% extends "layout.html" %}
{% set title = '${title}' %}
{% block page_title %}{{ title }}{% endblock %}

{% block content %}
<main id="content" role="main">
  <div class="breadcrumbs">
    <ol>
      <li><a href="/history">Design history</a></li>
    </ol>
  </div>
  <h1 class="heading-xlarge">{{ title }}</h1>
`;

  var templateEnd = `
</main>
{% endblock %}
`;

  fs.writeFile(indexDirectory + "/index.html", templateStart + template + templateEnd, function(err) {
    if (err) {
      return console.log(err);
    }
    console.log(`${indexDirectory}/index.html file generated.`);
  });
});

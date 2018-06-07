var basicAuth = require('basic-auth')
var config = require('../app/config.js')
var fs = require('fs')
var marked = require('marked')
var path = require('path')
var portScanner = require('portscanner')
var prompt = require('prompt')
var request = require('sync-request')

// Variables
var releaseUrl = null

// require core and custom filters, merges to one object
// and then add the methods to nunjucks env obj
exports.addNunjucksFilters = function (env) {
  var coreFilters = require('./core_filters.js')(env)
  var customFilters = require('../app/filters.js')(env)
  var filters = Object.assign(coreFilters, customFilters)
  Object.keys(filters).forEach(function (filterName) {
    env.addFilter(filterName, filters[filterName])
  })
}

/**
 * Simple basic auth middleware for use with Express 4.x.
 *
 * Based on template found at: http://www.danielstjules.com/2014/08/03/basic-auth-with-express-4/
 *
 * @example
 * app.use('/api-requiring-auth', utils.basicAuth('username', 'password'))
 *
 * @param   {string}   username Expected username
 * @param   {string}   password Expected password
 * @returns {function} Express 4 middleware requiring the given credentials
 */

exports.basicAuth = function (username, password) {
  return function (req, res, next) {
    if (!username || !password) {
      console.log('Username or password is not set.')
      return res.send('<h1>Error:</h1><p>Username or password not set. <a href="https://govuk-prototype-kit.herokuapp.com/docs/publishing-on-heroku#5-set-a-username-and-password">See guidance for setting these</a>.</p>')
    }

    var user = basicAuth(req)

    if (!user || user.name !== username || user.pass !== password) {
      res.set('WWW-Authenticate', 'Basic realm=Authorization Required')
      return res.sendStatus(401)
    }

    next()
  }
}

exports.findAvailablePort = function (app, callback) {
  var port = null

  try {
    port = Number(fs.readFileSync(path.join(__dirname, '/../.port.tmp')))
  } catch (e) {
    port = Number(process.env.PORT || config.port)
  }

  console.log('')

  // Check that default port is free, else offer to change
  portScanner.findAPortNotInUse(port, port + 50, '127.0.0.1', function (error, availablePort) {
    if (error) { throw error }
    if (port === availablePort) {
      callback(port)
    } else {
      // Default port in use - offer to change to available port
      console.error('ERROR: Port ' + port + ' in use - you may have another prototype running.\n')
      // Set up prompt settings
      prompt.colors = false
      prompt.start()
      prompt.message = ''
      prompt.delimiter = ''

      // Ask user if they want to change port
      prompt.get([{
        name: 'answer',
        description: 'Change to an available port? (y/n)',
        required: true,
        type: 'string',
        pattern: /y(es)?|no?/i,
        message: 'Please enter y or n'
      }], function (err, result) {
        if (err) { throw err }
        if (result.answer.match(/y(es)?/i)) {
          // User answers yes
          port = availablePort
          fs.writeFileSync(path.join(__dirname, '/../.port.tmp'), port)
          console.log('Changed to port ' + port)

          callback(port)
        } else {
          // User answers no - exit
          console.log('\nYou can set a new default port in server.js, or by running the server with PORT=XXXX')
          console.log("\nExit by pressing 'ctrl + c'")
          process.exit(0)
        }
      })
    }
  })
}

exports.forceHttps = function (req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    console.log('Redirecting request to https')
    // 302 temporary - this is a feature that can be disabled
    return res.redirect(302, 'https://' + req.get('Host') + req.url)
  }
  next()
}

// Synchronously get the url for the latest release on github and store
exports.getLatestRelease = function () {
  var url = ''

  if (releaseUrl !== null) {
    // Release url already exists
    console.log('Release url cached:', releaseUrl)
    return releaseUrl
  } else {
    // Release url doesn't exist
    var options = {
      headers: {'user-agent': 'node.js'}
    }
    var gitHubUrl = 'https://api.github.com/repos/alphagov/govuk_prototype_kit/releases/latest'
    try {
      console.log('Getting latest release from github')

      var res = request('GET', gitHubUrl, options)
      var data = JSON.parse(res.getBody('utf8'))
      var zipballUrl = data['zipball_url']
      var releaseVersion = zipballUrl.split('/').pop()
      var urlStart = 'https://github.com/alphagov/govuk_prototype_kit/archive/'
      var urlEnd = '.zip'
      var zipUrl = urlStart + releaseVersion + urlEnd

      console.log('Release url is', zipUrl)
      releaseUrl = zipUrl
      url = releaseUrl
    } catch (err) {
      url = 'https://github.com/alphagov/govuk_prototype_kit/releases/latest'
      console.log("Couldn't retrieve release url")
    }
  }
  return url
}

// Matches routes
exports.matchRoutes = function (req, res) {
  var path = (req.params[0])
  res.render(path, function (err, html) {
    if (err) {
      res.render(path + '/index', function (err2, html) {
        if (err2) {
          res.status(404).send(err + '<br>' + err2)
        } else {
          res.end(html)
        }
      })
    } else {
      res.end(html)
    }
  })
}

exports.matchMdRoutes = function (req, res) {
  var docsPath = '/../docs/documentation/'
  if (fs.existsSync(path.join(__dirname, docsPath, req.params[0] + '.md'), 'utf8')) {
    var doc = fs.readFileSync(path.join(__dirname, docsPath, req.params[0] + '.md'), 'utf8')
    var html = marked(doc)
    res.render('documentation_template', {'document': html})
    return true
  }
  return false
}

// store data from POST body or GET query in session

var storeData = function (input, store) {
  for (var i in input) {
    // any input where the name starts with _ is ignored
    if (i.indexOf('_') === 0) {
      continue
    }

    var val = input[i]

    // delete single unchecked checkboxes
    if (val === '_unchecked' || val === ['_unchecked']) {
      delete store.data[i]
      continue
    }

    // remove _unchecked from arrays
    if (Array.isArray(val)) {
      var index = val.indexOf('_unchecked')
      if (index !== -1) {
        val.splice(index, 1)
      }
    }

    store.data[i] = val
  }
}

// Middleware - store any data sent in session, and pass it to all views

exports.autoStoreData = function (req, res, next) {
  if (!req.session.data) {
    req.session.data = {
      'study-type': ['Full time (12 months)', 'Part time (18-24 months)'],
      'qualification': ['Postgraduate certificate in education with qualified teacher status', 'Qualified teacher status'],
      'results': [
        {
          "distance": "1",
          "id": "1",
          "entity": "school",
          "provider": "Associated Merseyside Partnership SCITT",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "Deyes Lane, Maghull, Merseyside, L31 6DE"
        },
        {
          "distance": "1",
          "id": "2",
          "entity": "school",
          "provider": "Astra SCITT",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "Dr Challoner's Grammar School, Chesham Rd, Amersham, Buckinghamshire, HP6 5HA"
        },
        {
          "distance": "1",
          "id": "4",
          "entity": "university",
          "provider": "Bath Spa University",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Newton Saint Loe, Bath, BA2 9BN"
        },
        {
          "distance": "2",
          "id": "5",
          "entity": "school",
          "provider": "Biddulph High School",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "Conway Road, Knypersley, Stoke-on-Trent, Staffordshire, ST8 7AR"
        },
        {
          "distance": "2",
          "id": "6",
          "entity": "school",
          "provider": "Bishop Ramsey CofE School",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "c/o Bishop Ramsey School, Hume Way, Ruislip, Middlesex, HA4 8EE"
        },
        {
          "distance": "2",
          "id": "7",
          "entity": "school",
          "provider": "Bitterne Park Teaching School Alliance",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Bitterne Park School, Dimond Road, Bitterne Park, Southampton, SO18 1BU"
        },
        {
          "distance": "2",
          "id": "8",
          "entity": "school",
          "provider": "Bluecoat Academy",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Aspley Lane, Aspley, Nottingham, NG8 5GY"
        },
        {
          "distance": "2",
          "id": "9",
          "entity": "school",
          "provider": "Bromley Schools' Collegiate",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Chislehurst School for Girls, Beaverwood Road, Chislehurst, BR7 6HE"
        },
        {
          "distance": "3",
          "id": "10",
          "entity": "university",
          "provider": "Canterbury Christ Church University",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Old Sessions House, N Holmes Rd, Canterbury, CT1 1NX"
        },
        {
          "distance": "3",
          "id": "11",
          "entity": "school",
          "provider": "Chauncy School",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Park Rd, Ware, SG12 0DP"
        },
        {
          "distance": "3",
          "id": "12",
          "entity": "school",
          "provider": "Claydon High School",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "Claydon High School, Church Lane, Claydon, Suffolk, IP6 0EG"
        },
        {
          "distance": "3",
          "id": "13",
          "entity": "school",
          "provider": "Comberton Village College (Cambs Teaching Schools Network)",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "West St, Comberton, Cambridge, CB23 7DU"
        },
        {
          "distance": "3",
          "id": "14",
          "entity": "school",
          "provider": "Compton SCITT",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "The Compton School, North Finchley, Summers Lane, London, N12 0QG"
        },
        {
          "distance": "4",
          "id": "15",
          "entity": "school",
          "provider": "Doncaster Regional Alliance For Teacher Training Secondary",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Doncaster Regional Alliance For Teacher Training Secondary, Ridgewood School, Barnsley Road, Scawsby, Doncaster, South Yorkshire, DN5 7UB"
        },
        {
          "distance": "4",
          "id": "16",
          "entity": "school",
          "provider": "Dr Challoner's High School (ITT Bucks Hub)",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "Cokes Lane, Little Chalfont, Buckinghamshire, HP7 9QB"
        },
        {
          "distance": "4",
          "id": "17",
          "entity": "school",
          "provider": "East Herts Schools Direct Partnership",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "Goffs Academy, Goffs Lane, Cheshunt, EN7 5QW"
        },
        {
          "distance": "4",
          "id": "19",
          "entity": "school",
          "provider": "e-Qualitas",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "23 Mountfield Gardens, Tunbridge Wells, TN1 1SJ"
        },
        {
          "distance": "5",
          "id": "20",
          "entity": "school",
          "provider": "Fakenham Academy Partnership",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "City College Norwich, Ipswich Road, Norwich, NR2 2LJ"
        },
        {
          "distance": "5",
          "id": "22",
          "entity": "school",
          "provider": "George Spencer Academy And Technology College",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "Arthur Mee Road, Stapleford, Nottingham, NG9 7EW"
        },
        {
          "distance": "5",
          "id": "23",
          "entity": "school",
          "provider": "GLF Schools' Teacher Training",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "Glyn School, Kingsway, Ewell, Surrey, KT17 1NB"
        },
        {
          "distance": "5",
          "id": "24",
          "entity": "school",
          "provider": "Goffs School (East Herts Partnership)",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Goff's Ln, Cheshunt, Waltham Cross, EN7 5QW"
        },
        {
          "distance": "6",
          "id": "25",
          "entity": "school",
          "provider": "Green Light Teaching School Alliance",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "Shelley College, Huddersfield Road, Shelley, HD8 8NL"
        },
        {
          "distance": "6",
          "id": "26",
          "entity": "school",
          "provider": "Harris Initial Teacher Education",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "Steel House, 11 Tothill Street, Westminster, SW1H 9LH"
        },
        {
          "distance": "6",
          "id": "27",
          "entity": "school",
          "provider": "Harton Technology School Alliance",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "Harton Academy, Lisle Road, South Shields, Tyne and Wear, NE34 6DL"
        },
        {
          "distance": "6",
          "id": "28",
          "entity": "school",
          "provider": "Haybridge Alliance SCITT",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Brake Lane, Hagley, West Midlands, DY8 2XS"
        },
        {
          "distance": "6",
          "id": "29",
          "entity": "school",
          "provider": "Hitchin Boys School",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Grammar School Walk, Hitchin, SG5 1JB"
        },
        {
          "distance": "7",
          "id": "30",
          "entity": "school",
          "provider": "Humber Teaching School",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "Low Road, Healing, NE Lincs, DN41 7QD"
        },
        {
          "distance": "7",
          "id": "31",
          "entity": "school",
          "provider": "Kingston School Direct",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "UCL IOE, 20 Bedford Way, WC1H 0AL"
        },
        {
          "distance": "7",
          "id": "32",
          "entity": "school",
          "provider": "Kirklees and Calderdale SCITT",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "The John Curwen Primary Academy, Leeds Old Road, Heckmondwike, WF16 9BB"
        },
        {
          "distance": "7",
          "id": "33",
          "entity": "university",
          "provider": "Leeds Trinity University",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Brownberrie Lane, Horsforth, Leeds, LS18 5HD"
        },
        {
          "distance": "7",
          "id": "34",
          "entity": "school",
          "provider": "Lightwoods Teaching School Alliance",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "Castle Road East, Oldbury, B68 9BG"
        },
        {
          "distance": "8",
          "id": "35",
          "entity": "school",
          "provider": "Manchester Nexus SCITT",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "The Blue Coat School, Egerton St, Oldham, OL1 3SQ"
        },
        {
          "distance": "8",
          "id": "36",
          "entity": "school",
          "provider": "Mid Essex Initial Teacher Training",
          "options": [
            "PGCE with QTS, 1 year full time",
            "PGCE with QTS, Up to 2 years part time"
          ],
          "address": "Notley High School, Notley Road, Braintree, Essex, CM7 1WY"
        },
        {
          "distance": "8",
          "id": "37",
          "entity": "school",
          "provider": "North London New River Teaching Alliance",
          "options": [
            "PGCE with QTS, 1 year full time with salary",
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Alexandra Park School, Bidwell Gardens, London, N11 2AZ"
        },
        {
          "distance": "8",
          "id": "38",
          "entity": "university",
          "provider": "Nottingham Trent University",
          "options": [
            "PGCE with QTS, 1 year full time"
          ],
          "address": "Clifton Campus, Nottingham, NG11 8NS"
        },
        {
          "distance": "8",
          "id": "39",
          "entity": "school",
          "provider": "Parmiter's School",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time"
          ],
          "address": "High Elms Lane, Watford, WD25 0UU"
        },
        {
          "distance": "9",
          "id": "40",
          "entity": "school",
          "provider": "Partnership London SCITT (PLS)",
          "options": [
            "PGCE with QTS, 1 year full time",
            "QTS, 1 year full time with salary"
          ],
          "address": "Sydney Russell School, Parsloes Avenue, Dagenham, Essex, RM9 5QT"
        }
      ]
    }
  }

  storeData(req.body, req.session)
  storeData(req.query, req.session)

  // send session data to all views

  res.locals.data = {}

  for (var j in req.session.data) {
    res.locals.data[j] = req.session.data[j]
  }

  next()
}

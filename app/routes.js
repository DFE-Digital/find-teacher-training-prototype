const express = require('express')
const router = express.Router()

require('./routes/start')(router)
require('./routes/results')(router)
require('./routes/filters')(router)
require('./routes/course')(router)
require('./routes/apply')(router)
require('./routes/providers')(router)

module.exports = router

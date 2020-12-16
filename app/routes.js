const express = require('express')
const router = express.Router()

require('./routes/start')(router)
require('./routes/results')(router)
require('./routes/filters')(router)
require('./routes/course')(router)
require('./routes/locations')(router)

module.exports = router

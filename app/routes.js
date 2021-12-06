const express = require('express')
const router = express.Router()

require('./routes/admin')(router)
require('./routes/course')(router)
require('./routes/results')(router)
require('./routes/start')(router)

module.exports = router

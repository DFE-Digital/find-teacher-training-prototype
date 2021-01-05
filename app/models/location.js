const got = require('got')
const CacheService = require('../services/cache.js')

const ttl = 60 * 60 * 24 * 30 // cache for 30 days
const cache = new CacheService(ttl) // Create a new cache service instance

const locationModel = {
  async getPoint (latitude, longitude, type = 'TTW') {
    const key = `point_${latitude}-${longitude}-${type}`
    const data = await cache.get(key, async () => await got(`https://mapit.mysociety.org/point/4326/${longitude},${latitude}?api_key=${process.env.MAPIT_API_KEY}&type=${type}`).json())
    const point = data[Object.keys(data)[0]]
    return point
  }
}

module.exports = locationModel

const NodeCache = require('node-cache')

class CacheService {
  constructor (ttlSeconds) {
    this.cache = new NodeCache({
      stdTTL: ttlSeconds,
      checkperiod: ttlSeconds * 0.2,
      useClones: false
    })
  }

  get (key, apiRequest) {
    const value = this.cache.get(key)
    if (value) {
      console.log(`Fetching ${key} from cache`)
      return Promise.resolve(value)
    }

    return apiRequest().then((result) => {
      console.log(`Fetching ${key} from API`)
      this.cache.set(key, result)
      return result
    })
  }

  del (keys) {
    this.cache.del(keys)
  }

  delStartWith (startStr = '') {
    if (!startStr) {
      return
    }

    const keys = this.cache.keys()
    for (const key of keys) {
      if (key.indexOf(startStr) === 0) {
        this.del(key)
      }
    }
  }

  flush () {
    this.cache.flushAll()
  }
}

module.exports = CacheService

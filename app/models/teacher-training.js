const got = require('got')
const qs = require('qs')
const CacheService = require('../services/cache.js')
const data = require('../data/session-data-defaults')

const ttl = 60 * 60 * 24 * 30 // cache for 30 days
const cache = new CacheService(ttl) // Create a new cache service instance

const teacherTrainingModel = {
  async getCourses (page, perPage, filter) {
    const query = {
      filter,
      include: 'provider,accredited_body',
      page,
      per_page: perPage,
      sort: 'provider.provider_name'
    }

    const key = `courses_${page}-${perPage}-${JSON.stringify(query)}`
    return cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/courses/?${qs.stringify(query)}`).json())
  },

  async getCourse (providerCode, courseCode) {
    const key = `course_${data.cycle}-${providerCode}-${courseCode}`
    return cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/providers/${providerCode}/courses/${courseCode}?include=provider`).json())
  },

  async getCourseLocations (providerCode, courseCode) {
    const key = `course_${data.cycle}-${providerCode}-${courseCode}`
    return cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/providers/${providerCode}/courses/${courseCode}/locations?include=course,location_status,provider`).json())
  }
}

module.exports = teacherTrainingModel

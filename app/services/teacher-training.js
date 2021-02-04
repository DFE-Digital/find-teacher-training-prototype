const got = require('got')
const qs = require('qs')
const CacheService = require('../services/cache.js')
const data = require('../data/session-data-defaults')

const ttl = 60 * 60 * 24 * 30 // cache for 30 days
const cache = new CacheService(ttl) // Create a new cache service instance

const teacherTrainingService = {
  async getCourses (page, perPage, filter) {
    const query = {
      filter,
      include: 'provider,accredited_body',
      page,
      per_page: perPage,
      sort: 'provider.provider_name'
    }

    const key = `courseListResponse_${page}-${perPage}-${JSON.stringify(query)}`
    const courseListResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/courses/?${qs.stringify(query)}`).json())
    return courseListResponse
  },

  async getProviderCourses (page, perPage, filter, providerCode) {
    const query = {
      filter,
      include: 'provider,accredited_body',
      page,
      per_page: perPage,
      sort: 'provider.provider_name'
    }

    const key = `courseListResponse_${page}-${perPage}-${JSON.stringify(query)}`
    const courseListResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/providers/${providerCode}/courses/?${qs.stringify(query)}`).json())
    return courseListResponse
  },

  async getCourse (providerCode, courseCode) {
    try {
      const key = `courseSingleResponse_${data.cycle}-${providerCode}-${courseCode}`
      const courseSingleResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/providers/${providerCode}/courses/${courseCode}?include=provider`).json())

      const providerResource = courseSingleResponse.included.find(item => item.type === 'providers')
      const provider = providerResource.attributes
      courseSingleResponse.data.attributes.provider = provider

      return courseSingleResponse
    } catch (error) {
      console.error(error)
    }
  },

  async getCourseLocations (providerCode, courseCode) {
    const key = `locationListResponse_${data.cycle}-${providerCode}-${courseCode}`
    const locationListResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/recruitment_cycles/${data.cycle}/providers/${providerCode}/courses/${courseCode}/locations?include=course,location_status,provider`).json())
    return locationListResponse
  },

  async getProviderSuggestions (query) {
    const key = `providerSuggestionListResponse_${query}`
    const providerSuggestionListResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/provider_suggestions?query=${query}`).json())
    return providerSuggestionListResponse
  }
}

module.exports = teacherTrainingService

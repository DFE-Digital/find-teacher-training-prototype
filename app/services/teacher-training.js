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

      const course = courseSingleResponse.data.attributes
      const provider = providerResource.attributes
      course.provider = provider

      // Length
      switch (course.course_length) {
        case 'OneYear':
          course.length = '1 year'
          break
        case 'TwoYears':
          course.length = 'Up to 2 years'
          break
        default:
          course.length = course.course_length
      }

      // Funding
      course.has_fees = course.funding_type === 'fee'
      course.salaried = course.funding_type === 'salary' || course.funding_type === 'apprenticeship'
      course.funding_option = course.salaried ? 'Salary' : 'Student finance if you’re eligible'
      course.has_bursary = course.name.includes('Chemistry') // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L47
      course.has_scholarship = true // Stub. See https://github.com/DFE-Digital/find-teacher-training/blob/94de46eea7ddeec2daca2e4944b9bf4582d25304/app/decorators/course_decorator.rb#L59
      course.bursary_only = course.has_bursary && !course.has_scholarship
      course.has_scholarship_and_bursary = course.has_bursary && course.has_scholarship

      // Year range
      course.year_range = `${data.cycle} to ${Number(data.cycle) + 1}`

      return course
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

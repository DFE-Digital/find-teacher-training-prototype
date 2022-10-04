const _ = require('lodash')
const got = require('got')
const qs = require('qs')
const CacheService = require('../services/cache.js')
const data = require('../data/session-data-defaults')

// const ttl = 60 * 60 * 24 * 30 // cache for 30 days
const ttl = 0
const cache = new CacheService(ttl) // Create a new cache service instance

const teacherTrainingService = {
  async getCourses (page, perPage, filter) {
    const query = {
      filter,
      include: 'provider,accredited_body',
      page,
      per_page: perPage,
      sort: 'provider.provider_name,name'
    }

    const key = `courseListResponse_${data.cycle}-${page}-${perPage}-${JSON.stringify(query)}`
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

    const key = `courseListResponse_${data.cycle}-${providerCode}-${page}-${perPage}-${JSON.stringify(query)}`
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
  },

  async getProvider (query) {
    const key = `providerSingleResponse_${query}`
    const providerSuggestionListResponse = await cache.get(key, async () => await got(`${data.apiEndpoint}/provider_suggestions?query=${query}`).json())
    return providerSuggestionListResponse?.data[0]?.attributes
  },

  async getEngineersTeachPhysicsCourses (page, perPage, filter) {
    const courseListResponse = require('../data/engineers-teach-physics-courses')

    const arrayEquals = (a, b) => {
      return Array.isArray(a) &&
        Array.isArray(b) &&
        a.length === b.length &&
        a.every((val, index) => val === b[index]);
    }

    const parseQualification = (qualification) => {
      const q = qualification.split('_')
      return q.filter(q => q !== 'with')
    }

    // Filter the courseListResponse.data
    let courseData = courseListResponse.data

    // is_send
    if (filter?.send_courses) {
      courseData = courseData.filter(course => course.attributes.is_send === filter.send_courses)
    }

    // has_vacancies
    if (filter?.has_vacancies) {
      courseData = courseData.filter(course => course.attributes.has_vacancies === filter.has_vacancies)
    }

    // study_mode
    if (filter?.study_type) {
      courseData = courseData.filter(course => filter.study_type.split(',').includes(course.attributes.study_mode))
    }

    // funding_type
    if (filter?.funding_type === 'include') {
      courseData = courseData.filter(course => course.attributes.funding_type === 'salary')
    }

    // degree_grade
    if (filter?.degree_grade) {
      courseData = courseData.filter(course => filter.degree_grade.split(',').includes(course.attributes.degree_grade))
    }

    // qualification
    if (filter?.qualification) {
      // parse the filter qualification list as an array of items
      const qualifications = filter.qualification.split(',')

      // filter.qualification = [ 'pgce_with_qts', 'pgde_with_qts', 'qts' ]
      // course.qualifications = ['pgce', 'qts']

      // place to store filtered course data
      const filteredData = []

      // iterate over the qualifications from the filter
      qualifications.forEach((qualification, i) => {
        // parse the filter qualification as an array (and remove 'with')
        const q = parseQualification(qualification)
        // sort the filter qualification array a-z so we get ['pgce', 'qts']
        q.sort((x,y) => {
          return x.localeCompare(y)
        })

        const data = courseData.filter(course => {
          // sort the course qualifications array a-z so we get ['pgce', 'qts']
          course.attributes.qualifications.sort((x,y) => {
            return x.localeCompare(y)
          })

          // check if the course qualifcations array matches the filter
          if (arrayEquals(course.attributes.qualifications, q)) {
            return true
          }
        })

        // push the course data to the filtered data
        filteredData.push(...data)
      })

      // push the filtered data back to the course data
      courseData = filteredData
    }

    return {
      data: courseData,
      included: courseListResponse.included,
      links: {
        first: '#',
        last: '#',
        prev: '#',
        next: '#'
      },
      meta: {
        count: courseData.length
      }
    }
  }
}

module.exports = teacherTrainingService

const qs = require('qs')
const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

const utilsHelper = require('../helpers/utils')

exports.list = async (req, res) => {
  const defaults = req.session.data.defaults

  if (req.session.data.filter === undefined) {
    req.session.data.filter = {}
  }

  // Search
  const keywords = req.session.data.keywords

  const hasSearch = !!((keywords))

  // Filters
  const visaSponsorship = null
  const providerType = null

  const visaSponsorships = utilsHelper.getCheckboxValues(visaSponsorship, req.session.data.filter.visaSponsorship)

  const providerTypes = utilsHelper.getCheckboxValues(providerType, req.session.data.filter.providerType)

  const hasFilters = !!((visaSponsorships?.length > 0)
    || (providerTypes?.length > 0)
  )

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (providerTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Provider type' },
        items: providerTypes.map((providerType) => {
          return {
            text: utilsHelper.getProviderTypeLabel(providerType),
            href: `/results/remove-provider-type-filter/${providerType}`
          }
        })
      })
    }
  }

  let selectedVisaSponsorship
  if (req.session.data.filter?.visaSponsorship) {
    selectedVisaSponsorship = req.session.data.filter.visaSponsorship
  } else {
    selectedVisaSponsorship = defaults.visaSponsorship
  }

  const visaSponsorshipItems = utilsHelper.getProviderVisaSponsorshipItems(selectedVisaSponsorship)

  let selectedProviderType
  if (req.session.data.filter?.providerType) {
    selectedProviderType = req.session.data.filter.providerType
  } else {
    // selectedProviderType = defaults.providerType
    selectedProviderType = []
  }

  const providerTypeItems = utilsHelper.getProviderTypeItems(selectedProviderType)

  // API query params
  // https://api.publish-teacher-training-courses.service.gov.uk/docs/api-reference.html#schema-providerfilter
  const filter = {
    provider_type: selectedProviderType.toString()
  }

  // sort by settings
  const sortBy = req.query.sortBy || req.session.data.sortBy || 0
  const sortByItems = utilsHelper.getProviderSortBySelectOptions(sortBy)

  // pagination settings
  const page = req.query.page || 1
  const perPage = 20

  try {
    let ProviderListResponse

    ProviderListResponse = await teacherTrainingService.getProviders(filter, page, perPage, sortBy)

    const { data, links, meta, included } = ProviderListResponse

    let providers = data

    if (providers.length > 0) {
      providers = providers.map(async providerResource => {
        provider = utils.decorateProvider(providerResource.attributes)
        return provider
      })
    }

    // TODO: something with the data

    let results = await Promise.all(providers)

    const resultsCount = meta ? meta.count : results.length

    let pageCount = 1
    if (links.last.match(/page=(\d*)/)) {
      pageCount = links.last.match(/page=(\d*)/)[1]
    }

    const prevPage = links.prev ? (parseInt(page) - 1) : false
    const nextPage = links.next ? (parseInt(page) + 1) : false

    const searchQuery = page => {
      const query = {
        page,
        filter: {
          providerType: selectedProviderType
        }
      }

      return qs.stringify(query)
    }

    const pagination = {
      pages: pageCount,
      next: nextPage
        ? {
            href: `?${searchQuery(nextPage)}`,
            page: nextPage,
            text: 'Next page'
          }
        : false,
      previous: prevPage
        ? {
            href: `?${searchQuery(prevPage)}`,
            page: prevPage,
            text: 'Previous page'
          }
        : false
    }

    res.render('./providers/index', {
      results,
      resultsCount,
      pagination,
      visaSponsorshipItems,
      providerTypeItems,
      selectedFilters,
      hasFilters,
      hasSearch,
      keywords,
      sortByItems,
      actions: {
        view: '/providers',
        filters: {
          apply: '/providers',
          remove: '/providers/remove-all-filters'
        },
        search: {
          find: '/providers',
          remove: '/providers/remove-keyword-search'
        }
      }
    })
  } catch (error) {
    console.error(error.stack)
    res.render('error', {
      title: error.name,
      content: error
    })
  }
}

exports.show = async (req, res) => {
  const ProviderSingleResponse = await teacherTrainingService.getProvider(req.params.providerCode)

  // pagination settings
  const sortBy = req.query.sortBy || 'name'
  const page = req.query.page || 1
  const perPage = 100

  const filter = {
    findable: true,
    funding_type: req.session.data.defaults.fundingType.toString(),
    qualification: req.session.data.defaults.qualification.toString(),
    study_type: req.session.data.defaults.studyMode.toString()
  }

  const CourseListResponse = await teacherTrainingService.getProviderCourses(req.params.providerCode, filter, page, perPage)

  const { data, links, meta, included } = CourseListResponse

  let courses = data
  if (courses.length > 0) {
    const providers = included.filter(include => include.type === 'providers')

    courses = courses.map(async courseResource => {
      const course = utils.decorateCourse(courseResource.attributes)
      const courseRalationships = courseResource.relationships

      // Get course provider
      const providerId = courseRalationships.provider.data.id
      const providerResource = providers.find(providerResource => providerResource.id === providerId)
      const provider = providerResource.attributes

      // Get course accredited body
      if (courseRalationships.accredited_body.data) {
        const accreditedBodyId = courseRalationships.accredited_body.data.id
        const accreditedBody = providers.find(providerResource => providerResource.id === accreditedBodyId)
        course.accredited_body = accreditedBody.attributes.name
      }

      // Get locations
      const LocationListResponse = await teacherTrainingService.getCourseLocations(provider.code, course.code)
      const statuses = LocationListResponse.included.filter(item => item.type === 'location_statuses')
      const locations = LocationListResponse.data.map(location => {
        const { attributes } = location

        // Vacancy status
        const statusId = location.relationships.location_status.data.id
        const status = statuses.find(status => status.id === statusId)
        attributes.has_vacancies = status.attributes.has_vacancies

        // Address
        const streetAddress1 = attributes.street_address_1 ? attributes.street_address_1 + ', ' : ''
        const streetAddress2 = attributes.street_address_2 ? attributes.street_address_2 + ', ' : ''
        const city = attributes.city ? attributes.city + ', ' : ''
        const county = attributes.county ? attributes.county + ', ' : ''
        const postcode = attributes.postcode

        attributes.name = attributes.name.replace(/'/g, '’')
        attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

        return attributes
      })

      // Sort locations by disance
      locations.sort((a, b) => {
        return a.distance - b.distance
      })

      // Set course visa sponsorship based on provider
      course.visaSponsorship = {}
      course.visaSponsorship.canSponsorSkilledWorkerVisa = course.can_sponsor_skilled_worker_visa
      course.visaSponsorship.canSponsorStudentVisa = course.can_sponsor_student_visa

      const schools = locations.filter(location => location.code !== '-')

      course.trainingLocation = locations.find(location => location.code === '-')

      return {
        course,
        provider,
        schools
      }
    })
  }

  // Data
  const provider = ProviderSingleResponse

  const courseResults = await Promise.all(courses)

  const courseResultsCount = meta ? meta.count : courseResults.length

  let coursePageCount = 1
  if (links.last.match(/page=(\d*)/)) {
    coursePageCount = links.last.match(/page=(\d*)/)[1]
  }

  const prevPage = links.prev ? (parseInt(page) - 1) : false
  const nextPage = links.next ? (parseInt(page) + 1) : false

  const searchQuery = (page = null) => {
    const query = {
      latitude: req.session.data.latitude,
      longitude: req.session.data.longitude,
      page,
      filter: req.session.data.filter
    }

    return qs.stringify(query)
  }

  const coursesPagination = {
    pages: coursePageCount,
    next: nextPage
      ? {
          href: `?${searchQuery(nextPage)}`,
          page: nextPage,
          text: 'Next page'
        }
      : false,
    previous: prevPage
      ? {
          href: `?${searchQuery(prevPage)}`,
          page: prevPage,
          text: 'Previous page'
        }
      : false
  }

  courseResults.sort((a,b) => {
    return a.course.name.localeCompare(b.course.name)
  })

  // const ProviderLocationListResponse = await teacherTrainingService.getProviderLocations(req.params.providerCode)
  //
  // let providerLocations = []
  // if (ProviderLocationListResponse.data.length) {
  //   providerLocations = ProviderLocationListResponse.data.map(location => {
  //     const { attributes } = location
  //
  //     // Address
  //     const streetAddress1 = attributes.street_address_1 ? attributes.street_address_1 + ', ' : ''
  //     const streetAddress2 = attributes.street_address_2 ? attributes.street_address_2 + ', ' : ''
  //     const city = attributes.city ? attributes.city + ', ' : ''
  //     const county = attributes.county ? attributes.county + ', ' : ''
  //     const postcode = attributes.postcode
  //
  //     attributes.name = attributes.name.replace(/'/g, '’')
  //     attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`
  //
  //     return attributes
  //   })
  // }
  //
  // const locationResults = providerLocations
  // const locationResultsCount = providerLocations.length
  // const locationsPagination = {}

  let back = `/results?${searchQuery()}`
  if (req.query.referrer && req.query.courseCode) {
    back = `/providers/${req.params.providerCode}/courses/${req.query.courseCode}`
  }

  res.render('./provider/index', {
    provider,
    courses: {
      results: courseResults,
      totalCount: courseResultsCount,
      pagination: coursesPagination
    },
    locations: {
      results: [],
      totalCount: 0,
      pagination: {}
    },
    actions: {
      back
    }
  })
}

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  res.redirect('/providers')
}

exports.removeVisaSponsorshipFilter = (req, res) => {
  req.session.data.filter.visaSponsorship = utilsHelper.removeFilter(req.params.visaSponsorship, req.session.data.filter.visaSponsorship)
  res.redirect('/results')
}

exports.removeProviderTypeFilter = (req, res) => {
  req.session.data.filter.providerType = utilsHelper.removeFilter(req.params.providerType, req.session.data.filter.providerType)
  res.redirect('/results')
}

exports.removeAllFilters = (req, res) => {
  // req.session.data.filter.providerType = null
  // req.session.data.filter.visaSponsorship = null

  delete req.session.data.filter
  res.redirect('/providers')
}

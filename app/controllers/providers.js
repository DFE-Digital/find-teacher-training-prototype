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
  const accreditedBody = null
  const ageGroup = null
  const fundingType = null
  const providerType = null
  const region = null
  const send = null
  const visaSponsorship = null

  const accreditedBodies = utilsHelper.getCheckboxValues(accreditedBody, req.session.data.filter.accreditedBody)
  const ageGroups = utilsHelper.getCheckboxValues(ageGroup, req.session.data.filter.ageGroup)
  const fundingTypes = utilsHelper.getCheckboxValues(fundingType, req.session.data.filter.fundingType)
  const providerTypes = utilsHelper.getCheckboxValues(providerType, req.session.data.filter.providerType)
  const regions = utilsHelper.getCheckboxValues(region, req.session.data.filter.region)
  const sends = utilsHelper.getCheckboxValues(send, req.session.data.filter.send)
  const visaSponsorships = utilsHelper.getCheckboxValues(visaSponsorship, req.session.data.filter.visaSponsorship)

  const hasFilters = !!(
    (accreditedBodies?.length > 0)
    || (ageGroups?.length > 0)
    || (fundingTypes?.length > 0)
    || (providerTypes?.length > 0)
    || (regions?.length > 0)
    || (sends?.length > 0)
    || (visaSponsorships?.length > 0)
  )

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (accreditedBodies?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Accredited body' },
        items: accreditedBodies.map((accreditedBody) => {
          return {
            text: utilsHelper.getAccreditedBodyLabel(accreditedBody),
            href: `/providers/remove-accredited-body-filter/${accreditedBody}`
          }
        })
      })
    }

    if (sends?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Special educational needs' },
        items: sends.map((send) => {
          return {
            text: utilsHelper.getSendLabel(send),
            href: `/providers/remove-send-filter/${send}`
          }
        })
      })
    }

    if (providerTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Provider type' },
        items: providerTypes.map((providerType) => {
          return {
            text: utilsHelper.getProviderTypeLabel(providerType),
            href: `/providers/remove-provider-type-filter/${providerType}`
          }
        })
      })
    }

    if (visaSponsorships?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Visa sponsorship' },
        items: visaSponsorships.map((visaSponsorship) => {
          return {
            text: utilsHelper.getVisaSponsorshipLabel(visaSponsorship, 'providers'),
            href: `/providers/remove-visa-sponsorship-filter/${visaSponsorship}`
          }
        })
      })
    }

    if (fundingTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Funding type' },
        items: fundingTypes.map((fundingType) => {
          return {
            text: utilsHelper.getFundingTypeLabel(fundingType, 'providers'),
            href: `/providers/remove-funding-type-filter/${fundingType}`
          }
        })
      })
    }

    if (ageGroups?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Age group' },
        items: ageGroups.map((ageGroup) => {
          return {
            text: utilsHelper.getAgeGroupLabel(ageGroup),
            href: `/providers/remove-age-group-filter/${ageGroup}`
          }
        })
      })
    }

    if (regions?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Region' },
        items: regions.map((region) => {
          return {
            text: utilsHelper.getRegionLabel(region),
            href: `/providers/remove-region-filter/${region}`
          }
        })
      })
    }
  }

  let selectedAccreditedBody
  if (req.session.data.filter?.accreditedBody) {
    selectedAccreditedBody = req.session.data.filter.accreditedBody
  } else {
    // selectedAccreditedBody = defaults.accreditedBody
    selectedAccreditedBody = []
  }

  const accreditedBodyItems = utilsHelper.getAccreditedBodyItems(selectedAccreditedBody)

  let selectedAgeGroup
  if (req.session.data.filter?.ageGroup) {
    selectedAgeGroup = req.session.data.filter.ageGroup
  } else {
    // selectedAgeGroup = defaults.ageGroup
    selectedAgeGroup = []
  }

  const ageGroupItems = utilsHelper.getAgeGroupItems(selectedAgeGroup)

  let selectedProviderType
  if (req.session.data.filter?.providerType) {
    selectedProviderType = req.session.data.filter.providerType
  } else {
    // selectedProviderType = defaults.providerType
    selectedProviderType = []
  }

  const providerTypeItems = utilsHelper.getProviderTypeItems(selectedProviderType)

  let selectedRegion
  if (req.session.data.filter?.region) {
    selectedRegion = req.session.data.filter.region
  } else {
    // selectedRegion = defaults.region
    selectedRegion = []
  }

  const regionItems = utilsHelper.getRegionItems(selectedRegion)

  let selectedSend
  if (req.session.data.filter?.send) {
    selectedSend = req.session.data.filter.send
  } else {
    // selectedSend = defaults.send
    selectedSend = []
  }

  const sendItems = utilsHelper.getSendItems(selectedSend,'providers')

  let selectedVisaSponsorship
  if (req.session.data.filter?.visaSponsorship) {
    selectedVisaSponsorship = req.session.data.filter.visaSponsorship
  } else {
    // selectedVisaSponsorship = defaults.visaSponsorship
    selectedVisaSponsorship = []
  }

  // const visaSponsorshipItems = utilsHelper.getProviderVisaSponsorshipItems(selectedVisaSponsorship)
  const visaSponsorshipItems = utilsHelper.getVisaSponsorshipItems(selectedVisaSponsorship, 'providers')

  let selectedFundingType
  if (req.session.data.filter?.fundingType) {
    selectedFundingType = req.session.data.filter.fundingType
  } else {
    // selectedFundingType = defaults.fundingType
    selectedFundingType = []
  }

  const fundingTypeItems = utilsHelper.getFundingTypeItems(selectedFundingType,'providers')

  // API query params
  // https://api.publish-teacher-training-courses.service.gov.uk/docs/api-reference.html#schema-providerfilter
  const filter = {}

  if (selectedAccreditedBody.length) {
    // filter.accredited_body = selectedAccreditedBody
    filter.provider_type = 'university,scitt'
  }

  if (selectedProviderType.length) {
    filter.provider_type = selectedProviderType.toString()
  }

  // TODO: send selected age group to filter
  // if (selectedAgeGroup.length) {
  //   filter.age_group = selectedAgeGroup
  // }

  if (selectedRegion.length) {
    filter.region_code = selectedRegion.toString()
  }

  // TODO: send selected SEND to filter
  // if (selectedSend.length) {
  //   filter.send = selectedSend
  // }

  if (selectedVisaSponsorship.length) {
    // filter.can_sponsor_visas = true
    filter.can_sponsor_student_visa = true
    filter.can_sponsor_skilled_worker_visa = true
  }

  // sort by settings
  const sortBy = req.query.sortBy || req.session.data.sortBy || 0
  const sortByItems = utilsHelper.getProviderSortBySelectOptions(sortBy)

  // pagination settings
  const page = req.query.page || 1
  const perPage = 20

  try {
    let providerListResponse

    providerListResponse = await teacherTrainingService.getProviders(filter, page, perPage, sortBy)

    const { data, links, meta, included } = providerListResponse

    let providers = data

    if (providers.length > 0) {
      providers = providers.map(async providerResource => {
        const provider = utils.decorateProvider(providerResource.attributes)

        const filter = {

        }
        // const page = req.query.page || 1
        // const perPage = 100

        provider.has_primary_courses = false
        provider.primary_courses_count = 0
        provider.has_secondary_courses = false
        provider.secondary_courses_count = 0
        provider.has_further_education_courses = false
        provider.further_education_courses_count = 0

        provider.has_send_courses = false
        provider.send_courses_count = 0

        const courseListResponse = await teacherTrainingService.getProviderCourses(provider.code, filter, 1, 100, 0)

        const { data, links, meta, included } = courseListResponse

        let courses = data
        if (courses.length > 0) {
          courses.map(async courseResource => {
            const course = utils.decorateCourse(courseResource.attributes)

            if (course.level === 'primary') {
              provider.has_primary_courses = true
              provider.primary_courses_count += 1
            } else if (course.level === 'secondary') {
              provider.has_secondary_courses = true
              provider.secondary_courses_count += 1
            } else if (course.level === 'further_education') {
              provider.has_further_education_courses = true
              provider.further_education_courses_count += 1
            }

            if (course.is_send) {
              provider.has_send_courses = true
              provider.send_courses_count += 1
            }
          })
        }

        provider.offers_subject_levels = []
        if (provider.has_primary_courses) {
          provider.offers_subject_levels.push('primary')
        }
        if (provider.has_secondary_courses) {
          provider.offers_subject_levels.push('secondary')
        }
        if (provider.has_further_education_courses) {
          provider.offers_subject_levels.push('further education')
        }

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
      accreditedBodyItems,
      ageGroupItems,
      fundingTypeItems,
      providerTypeItems,
      regionItems,
      sendItems,
      visaSponsorshipItems,
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
  const providerSingleResponse = await teacherTrainingService.getProvider(req.params.providerCode)

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

  const courseListResponse = await teacherTrainingService.getProviderCourses(req.params.providerCode, filter, page, perPage)

  const { data, links, meta, included } = courseListResponse

  let courses = data
  if (courses.length > 0) {
    const providers = included.filter(include => include.type === 'providers')

    courses = courses.map(async courseResource => {
      const course = utils.decorateCourse(courseResource.attributes)
      const courseRalationships = courseResource.relationships

      // Get course provider
      const providerId = courseRalationships.provider.data.id
      const providerResource = providers.find(providerResource => providerResource.id === providerId)
      const provider = utils.decorateProvider(providerResource.attributes)

      // Get course accredited body
      if (courseRalationships.accredited_body.data) {
        const accreditedBodyId = courseRalationships.accredited_body.data.id
        const accreditedBody = providers.find(providerResource => providerResource.id === accreditedBodyId)
        course.accredited_body = accreditedBody.attributes.name
      }

      // Get locations
      const locationListResponse = await teacherTrainingService.getCourseLocations(provider.code, course.code)
      const statuses = locationListResponse.included.filter(item => item.type === 'location_statuses')
      const locations = locationListResponse.data.map(location => {
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
  const provider = utils.decorateProvider(providerSingleResponse)

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

  // const ProviderlocationListResponse = await teacherTrainingService.getProviderLocations(req.params.providerCode)
  //
  // let providerLocations = []
  // if (ProviderlocationListResponse.data.length) {
  //   providerLocations = ProviderlocationListResponse.data.map(location => {
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

exports.removeAccreditedBodyFilter = (req, res) => {
  req.session.data.filter.accreditedBody = utilsHelper.removeFilter(req.params.accreditedBody, req.session.data.filter.accreditedBody)
  res.redirect('/providers')
}

exports.removeAgeGroupFilter = (req, res) => {
  req.session.data.filter.ageGroup = utilsHelper.removeFilter(req.params.ageGroup, req.session.data.filter.ageGroup)
  res.redirect('/providers')
}

exports.removeFundingTypeFilter = (req, res) => {
  req.session.data.filter.fundingType = utilsHelper.removeFilter(req.params.fundingType, req.session.data.filter.fundingType)
  res.redirect('/providers')
}

exports.removeProviderTypeFilter = (req, res) => {
  req.session.data.filter.providerType = utilsHelper.removeFilter(req.params.providerType, req.session.data.filter.providerType)
  res.redirect('/providers')
}

exports.removeRegionFilter = (req, res) => {
  req.session.data.filter.region = utilsHelper.removeFilter(req.params.region, req.session.data.filter.region)
  res.redirect('/providers')
}

exports.removeSendFilter = (req, res) => {
  req.session.data.filter.send = utilsHelper.removeFilter(req.params.send, req.session.data.filter.send)
  res.redirect('/providers')
}

exports.removeVisaSponsorshipFilter = (req, res) => {
  req.session.data.filter.visaSponsorship = utilsHelper.removeFilter(req.params.visaSponsorship, req.session.data.filter.visaSponsorship)
  res.redirect('/providers')
}

exports.removeAllFilters = (req, res) => {
  // req.session.data.filter.accreditedBody = null
  // req.session.data.filter.ageGroup = null
  // req.session.data.filter.fundingType = null
  // req.session.data.filter.providerType = null
  // req.session.data.filter.region = null
  // req.session.data.filter.send = null
  // req.session.data.filter.visaSponsorship = null

  delete req.session.data.filter
  res.redirect('/providers')
}

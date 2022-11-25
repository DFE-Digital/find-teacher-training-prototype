const _ = require('lodash')
const qs = require('qs')
const geolib = require('geolib')

const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

const paginationHelper = require('../helpers/pagination')
const utilsHelper = require('../helpers/utils')

exports.closed = async (req, res) => {
  res.render('closed')
}

exports.list = async (req, res) => {
  const defaults = req.session.data.defaults

  if (process.env.USER_JOURNEY === 'filter' && req.session.data.filter === undefined) {
    req.session.data.filter = {}
  }

  // Search
  const keywords = req.session.data.keywords

  const hasSearch = !!((keywords))

  // Filters
  const subject = null
  const studyMode = null
  const qualification = null
  const degreeGrade = null
  const send = null
  const vacancy = null
  const visaSponsorship = null
  const fundingType = null
  const campaign = null
  const providerType = null

  const subjects = utilsHelper.getCheckboxValues(subject, req.session.data.filter.subject)

  let studyModes
  if (req.session.data.filter?.studyMode) {
    studyModes = utilsHelper.getCheckboxValues(studyMode, req.session.data.filter.studyMode)
  } else {
    studyModes = defaults.studyMode
  }

  let qualifications
  if (req.session.data.filter?.qualification) {
    qualifications = utilsHelper.getCheckboxValues(qualification, req.session.data.filter.qualification)
  } else {
    qualifications = defaults.qualification
  }

  let degreeGrades
  if (req.session.data.filter?.degreeGrade) {
    degreeGrades = utilsHelper.getCheckboxValues(degreeGrade, req.session.data.filter.degreeGrade)
  } else {
    degreeGrades = defaults.degreeGrade
  }

  const sends = utilsHelper.getCheckboxValues(send, req.session.data.filter.send)

  let vacancies
  if (req.session.data.filter?.vacancy) {
    vacancies = utilsHelper.getCheckboxValues(vacancy, req.session.data.filter.vacancy)
  } else {
    vacancies = defaults.vacancy
  }

  const visaSponsorships = utilsHelper.getCheckboxValues(visaSponsorship, req.session.data.filter.visaSponsorship)
  const fundingTypes = utilsHelper.getCheckboxValues(fundingType, req.session.data.filter.fundingType)

  const campaigns = utilsHelper.getCheckboxValues(campaign, req.session.data.filter.campaign)

  const providerTypes = utilsHelper.getCheckboxValues(providerType, req.session.data.filter.providerType)

  const hasFilters = !!((subjects?.length > 0)
    || (studyModes?.length > 0)
    || (qualifications?.length > 0)
    || (degreeGrades?.length > 0)
    || (sends?.length > 0)
    || (vacancies?.length > 0)
    || (visaSponsorships?.length > 0)
    || (fundingTypes?.length > 0)
    || (campaigns?.length > 0)
    || (providerTypes?.length > 0)
  )

  let selectedFilters = null

  if (hasFilters) {
    selectedFilters = {
      categories: []
    }

    if (subjects?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Subject' },
        items: subjects.map((subject) => {
          return {
            text: utilsHelper.getSubjectLabel(subject),
            href: `/results/remove-subject-filter/${subject}`
          }
        })
      })
    }

    if (campaigns?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Engineers teach physics' },
        items: campaigns.map((campaign) => {
          return {
            text: utilsHelper.getCampaignLabel(campaign),
            href: `/results/remove-campaign-filter/${campaign}`
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
            href: `/results/remove-send-filter/${send}`
          }
        })
      })
    }

    if (vacancies?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Vacancies' },
        items: vacancies.map((vacancy) => {
          return {
            text: utilsHelper.getVacancyLabel(vacancy),
            href: `/results/remove-vacancy-filter/${vacancy}`
          }
        })
      })
    }

    if (studyModes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Full time or part time' },
        items: studyModes.map((studyMode) => {
          return {
            text: utilsHelper.getStudyModeLabel(studyMode),
            href: `/results/remove-study-mode-filter/${studyMode}`
          }
        })
      })
    }

    if (qualifications?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Qualification' },
        items: qualifications.map((qualification) => {
          return {
            text: utilsHelper.getQualificationLabel(qualification),
            href: `/results/remove-qualification-filter/${qualification}`
          }
        })
      })
    }

    if (degreeGrades?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Degree required' },
        items: degreeGrades.map((degreeGrade) => {
          return {
            text: utilsHelper.getDegreeGradeLabel(degreeGrade),
            href: `/results/remove-degree-grade-filter/${degreeGrade}`
          }
        })
      })
    }

    if (visaSponsorships?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Degree required' },
        items: visaSponsorships.map((visaSponsorship) => {
          return {
            text: utilsHelper.getVisaSponsorshipLabel(visaSponsorship),
            href: `/results/remove-visa-sponsorship-filter/${visaSponsorship}`
          }
        })
      })
    }

    if (fundingTypes?.length) {
      selectedFilters.categories.push({
        heading: { text: 'Salary' },
        items: fundingTypes.map((fundingType) => {
          return {
            text: utilsHelper.getFundingTypeLabel(fundingType),
            href: `/results/remove-funding-type-filter/${fundingType}`
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
            href: `/results/remove-provider-type-filter/${providerType}`
          }
        })
      })
    }
  }

  let selectedSubject
  if (req.session.data.filter?.subject) {
    selectedSubject = req.session.data.filter.subject
  } else {
    selectedSubject = defaults.subject
  }

  const subjectItems = utilsHelper.getSubjectItems(selectedSubject, req.session.data.ageGroup)

  // get an array of selected subjects for use in the search terms subject list
  const selectedSubjects = utilsHelper.getSelectedSubjectItems(subjectItems.filter(subject => subject.checked === 'checked'))

  let selectedSend
  if (req.session.data.filter?.send) {
    selectedSend = req.session.data.filter.send
  } else {
    selectedSend = defaults.send
  }

  // req.session.data.filter.send = selectedSend

  const sendItems = utilsHelper.getSendItems(selectedSend)

  let selectedVacancy
  if (req.session.data.filter?.vacancy) {
    selectedVacancy = req.session.data.filter.vacancy
  } else if (req.query.filter?.vacancy === '_unchecked') {
    selectedVacancy = ['exclude']
  } else {
    selectedVacancy = defaults.vacancy
  }

  req.session.data.filter.vacancy = selectedVacancy

  const vacancyItems = utilsHelper.getVacancyItems(selectedVacancy)

  let selectedStudyMode
  if (req.session.data.filter?.studyMode) {
    selectedStudyMode = req.session.data.filter.studyMode
  } else {
    selectedStudyMode = defaults.studyMode
  }

  const studyModeItems = utilsHelper.getStudyModeItems(selectedStudyMode)

  let selectedQualification
  if (['browse','filter'].includes(process.env.USER_JOURNEY)) {
    if (req.session.data.filter?.qualification) {
      selectedQualification = req.session.data.filter.qualification
    } else {
      selectedQualification = []
    }
  } else {
    if (req.session.data.filter?.qualification) {
      selectedQualification = req.session.data.filter.qualification
    } else {
      // if the subject is further education, set the defaults to FE qualifications
      if (req.session.data.filter?.subject?.includes('41')) {
        selectedQualification = ['pgce','pgde']
      } else {
        selectedQualification = defaults.qualification
      }
    }
  }

  let qualificationItems = []
  if (['browse','filter'].includes(process.env.USER_JOURNEY)) {

    let hasQualifications = {
      primarySecondary: false,
      furtherEducation: false
    }

    if (subjects?.length) {
      subjects.forEach((subjectCode, i) => {
        let subjectLevel = utilsHelper.getSubjectLevelFromCode(subjectCode)

        let level
        if (['primary','secondary'].includes(subjectLevel)) {
          level = 'primarySecondary'
        } else {
          level = subjectLevel
        }

        if (!hasQualifications[level]) {
          qi = utilsHelper.getQualificationItems(selectedQualification, subjectLevel)
          qualificationItems.push(...qi)
        }

        hasQualifications[level] = true
      })

    } else {
      const primarySecondary = utilsHelper.getQualificationItems(selectedQualification, 'secondary')
      const furtherEducation = utilsHelper.getQualificationItems(selectedQualification, 'furtherEducation')
      qualificationItems = [...primarySecondary, ...furtherEducation]
    }

    qualificationItems.sort((a,b) => {
      return a.text.localeCompare(b.text)
    })

  } else {

    if (req.session.data.filter?.subject?.includes('41')) {
      qualificationItems = utilsHelper.getQualificationItems(selectedQualification, 'furtherEducation')
    } else {
      qualificationItems = utilsHelper.getQualificationItems(selectedQualification, req.session.data.ageGroup)
    }

  }

  let selectedDegreeGrade
  if (req.session.data.filter?.degreeGrade) {
    selectedDegreeGrade = req.session.data.filter.degreeGrade
  } else {
    selectedDegreeGrade = defaults.degreeGrade
  }

  const degreeGradeItems = utilsHelper.getDegreeGradeItems(selectedDegreeGrade)

  let selectedVisaSponsorship
  if (req.session.data.filter?.visaSponsorship) {
    selectedVisaSponsorship = req.session.data.filter.visaSponsorship
  // } else if (req.query.filter?.visaSponsorship === '_unchecked') {
  //   selectedVisaSponsorship = ['exclude']
  } else {
    selectedVisaSponsorship = defaults.visaSponsorship
  }

  const visaSponsorshipItems = utilsHelper.getVisaSponsorshipItems(selectedVisaSponsorship)

  let selectedFundingType
  if (req.session.data.filter?.fundingType) {
    selectedFundingType = req.session.data.filter.fundingType
  // } else if (req.query.filter?.fundingType === '_unchecked') {
  //   selectedFundingType = ['exclude']
  } else {
    selectedFundingType = defaults.fundingType
  }

  const fundingTypeItems = utilsHelper.getFundingTypeItems(selectedFundingType)

  let selectedCampaign
  if (req.session.data.filter?.campaign) {
    selectedCampaign = req.session.data.filter.campaign
  // } else if (req.query.filter?.campaign === '_unchecked') {
  //   selectedCampaign = ['exclude']
  } else {
    selectedCampaign = defaults.campaign
  }

  const campaignItems = utilsHelper.getCampaignItems(selectedCampaign)

  let selectedProviderType
  if (req.session.data.filter?.providerType) {
    selectedProviderType = req.session.data.filter.providerType
  } else {
    selectedProviderType = defaults.providerType
  }

  const providerTypeItems = utilsHelper.getProviderTypeItems(selectedProviderType)

  // Search radius - 5, 10, 50
  // default to 50
  // needed to get a list of results rather than 1
  const radius = req.session.data.radius || req.query.radius || defaults.radius

  // Search query
  const q = req.session.data.q || req.query.q

  // Location
  const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
  const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude

  // API query params
  // https://api.publish-teacher-training-courses.service.gov.uk/docs/api-reference.html#schema-coursefilter
  const filter = {
    findable: true,
    qualification: selectedQualification.toString(),
    study_type: selectedStudyMode.toString(),
    subjects: selectedSubject.toString()
  }

  if (selectedFundingType[0] === 'include') {
    filter.funding_type = 'salary'
  } else {
    filter.funding_type = selectedFundingType.toString()
  }

  // TODO: move provider_type into filter
  // provider_type = selectedProviderType.toString()

  // TODO: change the degreeGrade filter from radio to checkbox to manage grades properly
  if (selectedDegreeGrade === 'two_two') {
    filter.degree_grade = 'two_two,third_class,not_required'
  } else if (selectedDegreeGrade === 'third_class') {
    filter.degree_grade = 'third_class,not_required'
  } else if (selectedDegreeGrade === 'not_required') {
    filter.degree_grade = 'not_required'
  }

  if (selectedSend[0] === 'include') {
    filter.send_courses = true
  }

  if (selectedVacancy[0] === 'include') {
    filter.has_vacancies = true
  }

  if (selectedVisaSponsorship[0] === 'include') {
    filter.can_sponsor_visa = true
  }

  if (selectedCampaign[0] === 'include') {
    // filter.campaign_name = 'engineers_teach_physics'
    filter.engineers_teach_physics = true
  }


  // sort by settings
  const sortBy = req.query.sortBy || req.session.data.sortBy || 0
  const sortByItems = utilsHelper.getCourseSortBySelectOptions(sortBy)

  // pagination settings
  const page = req.query.page || 1
  const perPage = 20

  const hasSearchPhysics = !!(selectedSubjects.find(subject => subject.text === 'Physics'))
  try {
    let CourseListResponse

    if (q === 'provider') {
      // get the provider based on name from the autocomplete
      if (process.env.USER_JOURNEY === 'filter') {
        let providerSuggestionListResponse = await teacherTrainingService.getProviderSuggestions(req.session.data.keywords)

        // TODO: if the response contains multiple providers, redirect user to a page
        // to choose the appropriate provider before returning back to results list

        // get the first provider from the response
        req.session.data.provider = providerSuggestionListResponse?.data[0]?.attributes
      }

      CourseListResponse = await teacherTrainingService.getProviderCourses(req.session.data.provider.code, filter, page, perPage, sortBy)
    } else if (q === 'location') {
      if (radius) {
        filter.latitude = latitude
        filter.longitude = longitude
        filter.radius = radius
      }
      CourseListResponse = await teacherTrainingService.getCourses(filter, page, perPage, sortBy)
    } else {
      // England-wide search
      CourseListResponse = await teacherTrainingService.getCourses(filter, page, perPage, sortBy)
    }

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
        const provider = utils.decorateProvider(providerResource.attributes)

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

          // Distance from search location
          if (q === 'location') {
            let distanceInMeters = 0
            // if there's an error in the location details, we need to ignore
            if (attributes.latitude !== null && attributes.longitude !== null) {
              distanceInMeters = geolib.getDistance({
                latitude,
                longitude
              }, {
                latitude: attributes.latitude,
                longitude: attributes.longitude
              })
            }

            const distanceInMiles = ((parseInt(distanceInMeters) / 1000) * 0.621371).toFixed(0)
            attributes.distance = parseInt(distanceInMiles)
          }

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
    let results = await Promise.all(courses)

    const resultsCount = meta ? meta.count : results.length

    let pageCount = 1
    if (links.last.match(/page=(\d*)/)) {
      pageCount = links.last.match(/page=(\d*)/)[1]
    }

    const prevPage = links.prev ? (parseInt(page) - 1) : false
    const nextPage = links.next ? (parseInt(page) + 1) : false

    const searchQuery = page => {
      const query = {
        latitude,
        longitude,
        page,
        filter: {
          send: selectedSend,
          vacancy: selectedVacancy,
          studyMode: selectedStudyMode,
          qualification: selectedQualification,
          degreeGrade: selectedDegreeGrade,
          visaSponsorship: selectedVisaSponsorship,
          fundingType: selectedFundingType,
          subject: selectedSubject,
          campaign: selectedCampaign,
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

    const subjectItemsDisplayLimit = 10

    res.render('../views/results/index', {
      results,
      resultsCount,
      pagination,
      subjectItems,
      subjectItemsDisplayLimit,
      selectedSubjects,
      sendItems,
      vacancyItems,
      studyModeItems,
      qualificationItems,
      degreeGradeItems,
      visaSponsorshipItems,
      fundingTypeItems,
      campaignItems,
      providerTypeItems,
      selectedFilters,
      hasFilters,
      hasSearch,
      hasSearchPhysics,
      keywords,
      sortByItems,
      actions: {
        view: '/course/',
        filters: {
          apply: '/results',
          remove: '/results/remove-all-filters'
        },
        search: {
          find: '/results',
          remove: '/results/remove-keyword-search'
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

exports.removeKeywordSearch = (req, res) => {
  delete req.session.data.keywords
  delete req.session.data.provider
  delete req.session.data.q
  res.redirect('/results')
}

exports.removeSubjectFilter = (req, res) => {
  req.session.data.filter.subject = utilsHelper.removeFilter(req.params.subject, req.session.data.filter.subject)
  res.redirect('/results')
}

exports.removeSendFilter = (req, res) => {
  req.session.data.filter.send = utilsHelper.removeFilter(req.params.send, req.session.data.filter.send)
  res.redirect('/results')
}

exports.removeVacancyFilter = (req, res) => {
  req.session.data.filter.vacancy = utilsHelper.removeFilter(req.params.vacancy, req.session.data.filter.vacancy)
  res.redirect('/results')
}

exports.removeStudyModeFilter = (req, res) => {
  req.session.data.filter.studyMode = utilsHelper.removeFilter(req.params.studyMode, req.session.data.filter.studyMode)
  res.redirect('/results')
}

exports.removeQualificationFilter = (req, res) => {
  req.session.data.filter.qualification = utilsHelper.removeFilter(req.params.qualification, req.session.data.filter.qualification)
  res.redirect('/results')
}

exports.removeDegreeGradeFilter = (req, res) => {
  req.session.data.filter.degreeGrade = utilsHelper.removeFilter(req.params.degreeGrade, req.session.data.filter.degreeGrade)
  res.redirect('/results')
}

exports.removeVisaSponsorshipFilter = (req, res) => {
  req.session.data.filter.visaSponsorship = utilsHelper.removeFilter(req.params.visaSponsorship, req.session.data.filter.visaSponsorship)
  res.redirect('/results')
}

exports.removeFundingTypeFilter = (req, res) => {
  req.session.data.filter.fundingType = utilsHelper.removeFilter(req.params.fundingType, req.session.data.filter.fundingType)
  res.redirect('/results')
}

exports.removeCampaignFilter = (req, res) => {
  req.session.data.filter.campaign = utilsHelper.removeFilter(req.params.campaign, req.session.data.filter.campaign)
  res.redirect('/results')
}

exports.removeProviderTypeFilter = (req, res) => {
  req.session.data.filter.providerType = utilsHelper.removeFilter(req.params.providerType, req.session.data.filter.providerType)
  res.redirect('/results')
}

exports.removeAllFilters = (req, res) => {
  // req.session.data.filter.campaign = null
  // req.session.data.filter.degreeGrade = null
  // req.session.data.filter.fundingType = null
  // req.session.data.filter.providerType = null
  // req.session.data.filter.qualification = null
  // req.session.data.filter.send = null
  // req.session.data.filter.studyMode = null
  // req.session.data.filter.subject = null
  // req.session.data.filter.vacancy = null
  // req.session.data.filter.visaSponsorship = null

  delete req.session.data.filter
  res.redirect('/results')
}

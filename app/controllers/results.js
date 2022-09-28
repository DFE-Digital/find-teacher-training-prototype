const qs = require('qs')
const geolib = require('geolib')

const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

const paginationHelper = require('../helpers/pagination')
const utilsHelper = require('../helpers/utils')

exports.list = async (req, res) => {
  const defaults = req.session.data.defaults

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

  const hasFilters = !!((subjects?.length > 0)
    || (studyModes?.length > 0)
    || (qualifications?.length > 0)
    || (degreeGrades?.length > 0)
    || (sends?.length > 0)
    || (vacancies?.length > 0)
    || (visaSponsorships?.length > 0)
    || (fundingTypes?.length > 0)
    || (campaigns?.length > 0)
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
            text: utilsHelper.getVisaSponsorshipLabel(fundingType),
            href: `/results/remove-funding-type-filter/${fundingType}`
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

  const sendItems = utilsHelper.getSendItems(selectedSend)

  let selectedVacancy
  if (req.session.data.filter?.vacancy) {
    selectedVacancy = req.session.data.filter.vacancy
  } else if (req.query.filter?.vacancy === '_unchecked') {
    selectedVacancy = ['exclude']
  } else {
    selectedVacancy = defaults.vacancy
  }

  // const selectedVacancy = req.session.data.filter?.vacancy || req.query.filter?.vacancy || defaults.vacancy

  const vacancyItems = utilsHelper.getVacancyItems(selectedVacancy)

  let selectedStudyMode
  if (req.session.data.filter?.studyMode) {
    selectedStudyMode = req.session.data.filter.studyMode
  } else {
    selectedStudyMode = defaults.studyMode
  }

  const studyModeItems = utilsHelper.getStudyModeItems(selectedStudyMode)

  let selectedQualification
  if (req.session.data.filter?.qualification) {
    selectedQualification = req.session.data.filter.qualification
  } else {
    // if the subject is further education, set the defaults to FE qualifications
    if (req.session.data.filter?.subject.includes('41')) {
      selectedQualification = ['pgce','pgde']
    } else {
      selectedQualification = defaults.qualification
    }
  }

  const qualificationItems = utilsHelper.getQualificationItems(selectedQualification, req.session.data.ageGroup)

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
    funding_type: selectedFundingType.toString(),
    degree_grade: selectedDegreeGrade.toString(),
    send_courses: selectedSend[0] === 'include' ? true : false,
    has_vacancies: selectedVacancy[0] === 'include' ? true : false,
    qualification: selectedQualification.toString(),
    study_type: selectedStudyMode.toString(),
    can_sponsor_visa: selectedVisaSponsorship[0] === 'include' ? true : false,
    subjects: selectedSubject.toString()
  }

  // pagination settings
  const page = req.query.page || 1
  const perPage = 20

  try {
    let CourseListResponse
    if (q === 'provider') {
      CourseListResponse = await teacherTrainingService.getProviderCourses(page, perPage, filter, req.session.data.provider.code)
    } else if (q === 'location') {
      if (radius) {
        filter.latitude = latitude
        filter.longitude = longitude
        filter.radius = radius
      }
      CourseListResponse = await teacherTrainingService.getCourses(page, perPage, filter)
    } else {
      // England-wide search
      CourseListResponse = await teacherTrainingService.getCourses(page, perPage, filter)
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

          // Distance from search location
          if (q === 'location') {
            const distanceInMeters = geolib.getDistance({
              latitude,
              longitude
            }, {
              latitude: attributes.latitude,
              longitude: attributes.longitude
            })

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

    // sort results by training provider name
    if (['provider','england'].includes(req.session.data.q)) {
      results.sort((a, b) => {
        if (req.query.sortBy === '1') {
          // sorted by Training provider Z-A
          return b.provider.name.localeCompare(a.provider.name) || a.course.name.localeCompare(b.course.name)
        } else {
          // sorted by Training provider A-Z
          return a.provider.name.localeCompare(b.provider.name) || a.course.name.localeCompare(b.course.name)
        }
      })
    }

    const resultsCount = meta ? meta.count : results.length

    const pageCount = links.last.match(/page=(\d*)/)[1]

    const prevPage = links.prev ? (page - 1) : false
    const nextPage = links.next ? (page + 1) : false

    const searchQuery = page => {
      const query = {
        latitude,
        longitude,
        page,
        send,
        vacancy,
        studyMode,
        qualification,
        degreeGrade,
        visaSponsorship,
        fundingType,
        subjects
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

    const hasSearchPhysics = !!(selectedSubjects.find(subject => subject.text === 'Physics'))

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
      selectedFilters,
      hasFilters,
      hasSearch,
      hasSearchPhysics,
      keywords,
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
  // req.session.data.keywords = ''
  delete req.session.data.keywords
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

exports.removeAllFilters = (req, res) => {
  // req.session.data.filter.subject = null
  // req.session.data.filter.send = null
  // req.session.data.filter.vacancy = null
  // req.session.data.filter.studyMode = null
  // req.session.data.filter.qualification = null
  // req.session.data.filter.degreeGrade = null
  // req.session.data.filter.visaSponsorship = null
  // req.session.data.filter.fundingType = null
  // req.session.data.filter.camapign = null

  delete req.session.data.filter
  res.redirect('/results')
}

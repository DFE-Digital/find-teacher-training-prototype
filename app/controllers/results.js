const qs = require('qs')
const geolib = require('geolib')

const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

const paginationHelper = require('../helpers/pagination')
const utilsHelper = require('../helpers/utils')

exports.list = (req, res) => {
  const { defaults } = req.session.data

  // Search and filters
  const subject = null
  const studyMode = null
  const qualification = null
  const degreeGrade = null
  const send = null
  const vacancy = null
  const visaSponsorship = null
  const fundingType = null

  const keywords = req.session.data.keywords

  const subjects = utilsHelper.getCheckboxValues(subject, req.session.data.filter?.subject)
  const studyModes = utilsHelper.getCheckboxValues(studyMode, req.session.data.filter?.studyMode)
  const qualifications = utilsHelper.getCheckboxValues(qualification, req.session.data.filter?.qualification)
  const degreeGrades = utilsHelper.getCheckboxValues(degreeGrade, req.session.data.filter?.degreeGrade)
  const sends = utilsHelper.getCheckboxValues(send, req.session.data.filter?.send)
  const vacancies = utilsHelper.getCheckboxValues(vacancy, req.session.data.filter?.vacancy)
  const visaSponsorships = utilsHelper.getCheckboxValues(visaSponsorship, req.session.data.filter?.visaSponsorship)
  const fundingTypes = utilsHelper.getCheckboxValues(fundingType, req.session.data.filter?.fundingType)

  const hasSearch = !!((keywords))
  const hasFilters = !!((subjects?.length > 0)
    || (studyModes?.length > 0)
    || (qualifications?.length > 0)
    || (degreeGrades?.length > 0)
    || (sends?.length > 0)
    || (vacancies?.length > 0)
    || (visaSponsorships?.length > 0)
    || (fundingTypes?.length > 0)
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
  }

  const subjectItems = utilsHelper.getSubjectItems(selectedSubject, req.session.data.ageGroup)

  let selectedSend
  if (req.session.data.filter?.send) {
    selectedSend = req.session.data.filter.send
  }

  const sendItems = utilsHelper.getSendItems(selectedSend)

  let selectedVacancy
  if (req.session.data.filter?.vacancy) {
    selectedVacancy = req.session.data.filter.vacancy
  }

  const vacancyItems = utilsHelper.getVacancyItems(selectedVacancy)

  let selectedStudyMode
  if (req.session.data.filter?.studyMode) {
    selectedStudyMode = req.session.data.filter.studyMode
  }

  const studyModeItems = utilsHelper.getStudyModeItems(selectedStudyMode)

  let selectedQualification
  if (req.session.data.filter?.qualification) {
    selectedQualification = req.session.data.filter.qualification
  }

  const qualificationItems = utilsHelper.getQualificationItems(selectedQualification, req.session.data.ageGroup)

  let selectedDegreeGrade
  if (req.session.data.filter?.degreeGrade) {
    selectedDegreeGrade = req.session.data.filter.degreeGrade
  }

  const degreeGradeItems = utilsHelper.getDegreeGradeItems(selectedDegreeGrade)

  let selectedVisaSponsorship
  if (req.session.data.filter?.visaSponsorship) {
    selectedVisaSponsorship = req.session.data.filter.visaSponsorship
  }

  const visaSponsorshipItems = utilsHelper.getVisaSponsorshipItems(selectedVisaSponsorship)

  let selectedFundingType
  if (req.session.data.filter?.fundingType) {
    selectedFundingType = req.session.data.filter.fundingType
  }

  const fundingTypeItems = utilsHelper.getFundingTypeItems(selectedFundingType)

  // Search radius - 5, 10, 50
  // default to 50
  // needed to get a list of results rather than 1
  const radius = req.session.data.radius || req.query.radius || defaults.radius

  // Search query
  const q = req.session.data.q || req.query.q

  // Location
  const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
  const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude

  // Data
  let courses = []

  // Pagination
  const pagination = paginationHelper.getPagination(courses, req.query.page)

  // Slice the data to display
  courses = paginationHelper.getDataByPage(courses, pagination.pageNumber)

  const subjectItemsDisplayLimit = 10

  res.render('../views/results/index', {
    courses,
    pagination,
    subjectItems,
    subjectItemsDisplayLimit,
    sendItems,
    vacancyItems,
    studyModeItems,
    qualificationItems,
    degreeGradeItems,
    visaSponsorshipItems,
    fundingTypeItems,
    selectedFilters,
    hasFilters,
    hasSearch,
    keywords,
    actions: {
      view: `/course/`,
      filters: {
        apply: `/results`,
        remove: `/results/remove-all-filters`
      },
      search: {
        find: `/results`,
        remove: `/results/remove-keyword-search`
      }
    }
  })
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

exports.removeAllFilters = (req, res) => {
  // req.session.data.filter.subject = null
  // req.session.data.filter.send = null
  // req.session.data.filter.vacancy = null
  // req.session.data.filter.studyMode = null
  // req.session.data.filter.qualification = null
  // req.session.data.filter.degreeGrade = null
  // req.session.data.filter.visaSponsorship = null
  // req.session.data.filter.fundingType = null

  delete req.session.data.filter
  res.redirect('/results')
}

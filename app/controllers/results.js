const qs = require('qs')
const geolib = require('geolib')

const teacherTrainingService = require('../services/teacher-training')
const utils = require('../utils')()

exports.results_get = async (req, res) => {
  const { area, defaults, provider, subjectOptions } = req.session.data

  const page = Number(req.query.page) || 1
  const perPage = 20

  // ------------------------------------------------------------------------ //
  // LOCATION
  // ------------------------------------------------------------------------ //
  // Search radius - 5, 10, 50
  // default to 50
  // needed to get a list of results rather than 1
  const radius = req.session.data.radius || req.query.radius || defaults.radius

  // Search query
  const q = req.session.data.q || req.query.q

  // Location
  const latitude = req.session.data.latitude || req.query.latitude || defaults.latitude
  const longitude = req.session.data.longitude || req.query.longitude || defaults.longitude

  // ------------------------------------------------------------------------ //
  // FILTERS
  // ------------------------------------------------------------------------ //

  const subject = utils.toArray(req.session.data.primarySubjectSpecialisms || req.query.primarySubjectSpecialisms || defaults.primarySubjectSpecialisms)
  const primarySubjectItems = utils.primarySubjectItems(subject)

  console.log(primarySubjectItems);

  // Special educational needs
  const send = (req.session.data.send && req.session.data.send[0] === 'include')
    || (req.query.send && req.query.send[0] === 'include')
    || (defaults.send && defaults.send[0] === 'include')
  const sendItems = utils.sendItems(send)

  // Vacancies
  const vacancy = (req.session.data.vacancy && req.session.data.vacancy[0] === 'include')
    || (req.query.vacancy && req.query.vacancy[0] === 'include')
    || (defaults.vacancy && defaults.vacancy[0] === 'include')
  const vacancyItems = utils.vacancyItems(vacancy)

  // Study type - full time or part time
  const studyType = utils.toArray(req.session.data.studyType || req.query.studyType || defaults.studyType)
  const studyTypeItems = utils.studyTypeItems(studyType, {
    showHintText: false
  })

  // Qualifications - PGCE with QTS, PGDE with QTS, QTS, further education (PGCE or PGDE without QTS)
  const qualification = utils.toArray(req.session.data.qualification || req.query.qualification || defaults.qualification)
  const qualificationItems = utils.qualificationItems(qualification).map(item => {
    item.hint = false
    return item
  })

  // Entry Requirements (aka degree grade) - 2:1 or first, 2:2, third, pass
  const degreeGrade = utils.toArray(req.session.data.degreeGrade || req.query.degreeGrade || defaults.degreeGrade)
  const degreeGradeItems = utils.degreeGradeItems(degreeGrade).map(item => {
    item.hint = false
    return item
  })

  // Visa sponsorship
  const visaSponsorship = (req.session.data.visaSponsorship && req.session.data.visaSponsorship[0] === 'include')
    || (req.query.visaSponsorship && req.query.visaSponsorship[0] === 'include')
    || (defaults.visaSponsorship && defaults.visaSponsorship[0] === 'include')
  const visaSponsorshipItems = utils.visaSponsorshipItems(visaSponsorship)

  // Funding type - fee paying, salary, apprenticeship
  const fundingType = (req.session.data.fundingType && req.session.data.fundingType[0] === 'include')
    || (req.query.fundingType && req.query.fundingType[0] === 'include')
    || (defaults.fundingType && defaults.fundingType[0] === 'include')
  const fundingTypeItems = utils.fundingTypeItems(fundingType)

  // ------------------------------------------------------------------------ //
  // ------------------------------------------------------------------------ //

  // Subjects
  let subjects
  if (req.session.data.ageGroup === 'furtherEducation') {
    subjects = ['41'] // code for FE 'subject' in the API
  } else {
    subjects = utils.toArray(req.session.data.subjects || req.query.subjects || defaults.subjects)
  }

  if (subjects.includes('_unchecked')) {
    if (process.env.USER_JOURNEY === 'browse') {
      if (req.session.data.ageGroup === 'primary') {
        res.redirect('/primary')
      } else {
        res.redirect('/secondary')
      }
    } else {
      if (req.session.data.ageGroup === 'primary') {
        res.redirect('/primary-subjects?showError=true')
      } else {
        res.redirect('/secondary-subjects?showError=true')
      }
    }
  }

  // Show selected subjects at top of page
  // Maps array of subject codes to subject data
  const selectedSubjects = subjects.map(option => subjectOptions.find(subject => subject.value === option))

  // API query params
  const filter = {
    findable: true,
    funding_type: fundingType ? 'salary' : 'salary,apprenticeship,fee',
    degree_grade: degreeGrade.toString(),
    send_courses: send,
    has_vacancies: vacancy,
    qualification: qualification.toString(),
    study_type: studyType.toString(),
    can_sponsor_visa: visaSponsorship,
    subjects: subjects.toString()
  }

  // Current 'SEND' courses are a separate boolean, so this is
  // a stop-gap whilst we test whether it should become a specialist
  // subject instead, which would allow filters to return SEND courses
  // OR Primary with mathematics
  //
  // TODO: refactor once we’ve decided how to treat SEND specialist courses
  // if (subjects.includes('SEND') && !subjects.includes('00')) {
  //   filter.subjects = (subjects.concat('00').toString())
  //   filter.is_send = true
  // }

  try {
    let CourseListResponse
    if (q === 'provider') {
      CourseListResponse = await teacherTrainingService.getProviderCourses(page, perPage, filter, provider.code)
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

            const distanceInMiles = ((distanceInMeters / 1000) * 0.621371).toFixed(0)
            attributes.distance = distanceInMiles
          }

          return attributes
        })

        // Sort locations by disance
        locations.sort((a, b) => {
          return a.distance - b.distance
        })

        // Set course visa sponsorship based on provider
        course.visaSponsorship = {}
        course.visaSponsorship.canSponsorSkilledWorkerVisa = provider.can_sponsor_skilled_worker_visa
        course.visaSponsorship.canSponsorStudentVisa = provider.can_sponsor_student_visa

        const schools = locations.filter(location => location.code !== '-')

        course.trainingLocation = locations.find(location => location.code === '-')

        return {
          course,
          provider,
          schools
          // placementAreas
        }
      })
    }

    // Results
    const results = await Promise.all(courses)

    // sort results by training provider name
    results.sort((a, b) => {
      if (req.query.sortBy === '1') {
        // sorted by Training provider Z-A
        return b.provider.name.localeCompare(a.provider.name)
      } else {
        // sorted by Training provider A-Z
        return a.provider.name.localeCompare(b.provider.name)
      }
    })

    // ------------------------------------------------------------------------ //
    // PAGINATION
    // ------------------------------------------------------------------------ //

    // Pagination
    const pageCount = links.last.match(/page=(\d*)/)[1]
    // Provider courses response doesn’t return number of results
    // https://github.com/DFE-Digital/teacher-training-api/issues/1733
    let resultsCount = meta ? meta.count : results.length

    // Fake the results count based on visa sponsorship
    if (req.session.data.visaSponsorship === 'yes') {
      resultsCount = Math.floor(resultsCount / 2)
    }

    // Fake the results count based on number of degree requirement checkboxes ticked
    if (req.session.data.degreeGrade && req.session.data.degreeGrade.length !== 4) {
      resultsCount = Math.floor(resultsCount * (req.session.data.degreeGrade.length / 4))
    }

    const prevPage = links.prev ? (page - 1) : false
    const nextPage = links.next ? (page + 1) : false

    const searchQuery = page => {
      const query = {
        latitude,
        longitude,
        page,
        send,
        vacancy,
        studyType,
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

    // ------------------------------------------------------------------------ //
    // ------------------------------------------------------------------------ //

    res.render('results/index', {
      area,
      latLong: [latitude, longitude],
      pagination,
      provider,
      q,
      qualification,
      qualificationItems,
      radius,
      results,
      resultsCount,
      send,
      sendItems,
      vacancy,
      vacancyItems,
      studyType,
      studyTypeItems,
      degreeGrade,
      degreeGradeItems,
      visaSponsorship,
      visaSponsorshipItems,
      fundingType,
      fundingTypeItems,
      selectedSubjects,
      primarySubjectItems
    })
  } catch (error) {
    console.error(error.stack)
    res.render('error', {
      title: error.name,
      content: error
    })
  }
}

exports.results_post = async (req, res) => {
  await utils.processQuery(req.session.data.q, req.session.data)
  res.redirect('/results')
}

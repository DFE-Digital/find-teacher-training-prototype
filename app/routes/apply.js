const teacherTrainingModel = require('../models/teacher-training')

module.exports = router => {
  router.get('/course/:providerCode/:courseCode/apply', async (req, res) => {
    const { providerCode, courseCode } = req.params

    try {
      const course = await teacherTrainingModel.getCourse(providerCode, courseCode)

      res.render('apply/index', {
        backLink: {
          href: `/course/${providerCode}/${courseCode}`
        },
        course,
        provider: {
          code: providerCode
        }
      })
    } catch (error) {
      console.log('error', error)
      res.render('apply/404')
    }
  })

  router.post('/course/:providerCode/:courseCode/apply-route', async (req, res) => {
    const { providerCode, courseCode } = req.params
    const { route } = req.session.data

    if (route === 'ucas') {
      res.redirect(`/course/${providerCode}/${courseCode}/apply/ucas`)
    } else {
      res.redirect(`https://www.apply-for-teacher-training.service.gov.uk/candidate/account?providerCode=${providerCode}&courseCode=${courseCode}`)
    }
  })

  router.get('/course/:providerCode/:courseCode/apply/ucas', async (req, res) => {
    const { providerCode, courseCode } = req.params
    const { map } = req.query

    try {
      const LocationListResponse = await teacherTrainingModel.getCourseLocations(providerCode, courseCode)

      const course = LocationListResponse.included.filter(item => item.type === 'courses')[0].attributes
      const provider = LocationListResponse.included.filter(item => item.type === 'providers')[0].attributes

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
        const postcode = attributes.postcode ? attributes.postcode + ', ' : ''
        attributes.address = `${streetAddress1}${streetAddress2}${city}${county}${postcode}`

        return attributes
      })

      res.render('apply/locations', {
        backLink: {
          href: `/apply/${providerCode}/${courseCode}`
        },
        course,
        provider,
        locations,
        map
      })
    } catch (error) {
      console.error(error)
    }
  })

  router.get('/course/:providerCode/:courseCode/providers', async (req, res) => {
    const { providerCode, courseCode } = req.params

    res.render('apply/providers', {
      backLink: {
        href: `/apply/${providerCode}/${courseCode}`
      }
    })
  })
}

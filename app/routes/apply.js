const got = require('got')

const endpoint = process.env.TEACHER_TRAINING_API_URL
const cycle = process.env.RECRUITMENT_CYCLE

module.exports = router => {
  router.get('/apply/:providerCode/:courseCode', async (req, res) => {
    const { providerCode, courseCode } = req.params

    try {
      const { data } = await got(`${endpoint}/recruitment_cycles/${cycle}/providers/${providerCode}/courses/${courseCode}`).json()

      res.render('apply/index', {
        backLink: {
          href: `/course/${providerCode}/${courseCode}`
        },
        course: data.attributes,
        provider: {
          code: providerCode
        }
      })
    } catch (error) {
      res.render('apply/404')
    }
  })

  router.post('/apply/:providerCode/:courseCode/route', async (req, res) => {
    const { providerCode, courseCode } = req.params
    const { route } = req.session.data

    if (route === 'ucas') {
      res.redirect(`/apply/${providerCode}/${courseCode}/locations`)
    } else {
      res.redirect(`https://www.apply-for-teacher-training.service.gov.uk/candidate/account?providerCode=${providerCode}&courseCode=${courseCode}`)
    }
  })

  router.get('/apply/:providerCode/:courseCode/locations', async (req, res) => {
    const { providerCode, courseCode } = req.params
    const { map } = req.query

    try {
      const { data, included } = await got(`${endpoint}/recruitment_cycles/${cycle}/providers/${providerCode}/courses/${courseCode}/locations?include=course,location_status,provider`).json()

      const course = included.filter(item => item.type === 'courses')[0].attributes
      const provider = included.filter(item => item.type === 'providers')[0].attributes

      const statuses = included.filter(item => item.type === 'location_statuses')
      const locations = data.map(location => {
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

  router.get('/apply/:providerCode/:courseCode/providers', async (req, res) => {
    const { providerCode, courseCode } = req.params

    res.render('apply/providers', {
      backLink: {
        href: `/apply/${providerCode}/${courseCode}`
      }
    })
  })
}

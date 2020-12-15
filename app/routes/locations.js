const got = require('got')

const endpoint = process.env.TEACHER_TRAINING_API_URL
const cycle = process.env.RECRUITMENT_CYCLE

module.exports = router => {
  router.get('/course/:providerCode/:courseCode/locations', async function (req, res) {
    const { providerCode, courseCode } = req.params

    try {
      const { body } = await got(`${endpoint}/recruitment_cycles/${cycle}/providers/${providerCode}/courses/${courseCode}/locations?include=location_status`, {
        responseType: 'json'
      })

      const { data, included } = body

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

      res.render('locations', {
        backLink: `/course/${providerCode}/${courseCode}`,
        locations
      })
    } catch (error) {
      console.error(error.response.body)
    }
  })
}

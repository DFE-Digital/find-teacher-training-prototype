

exports.browse_get = async (req, res) => {
  if (process.env.USER_JOURNEY === 'search') {
    res.redirect('/search')
  } else {
    res.render('browse/index')
  }
}

exports.browse_post = async (req, res) => {

}

exports.primary_get = async (req, res) => {
  const cities = ['Birmingham','Bradford','Bristol','Leeds','Liverpool','London','Manchester','Sheffield']
  const regions = ['North East','North West','Yorkshire and The Humber','East Midlands','West Midlands','East of England','London','South East','South West']

  res.render('browse/primary', {
    cities,
    regions
  })
}

exports.primary_post = async (req, res) => {

  res.redirect('/results')
}

exports.secondary_get = async (req, res) => {

  res.render('browse/secondary', {

  })
}

exports.secondary_post = async (req, res) => {

  res.redirect(`/browse/secondary/subjects/${subject}`)
}

exports.secondary_subject_get = async (req, res) => {

  res.render('browse/subjects', {

  })
}

exports.secondary_subject_post = async (req, res) => {

  res.redirect('/results')
}

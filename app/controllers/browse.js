

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

}

exports.primary_post = async (req, res) => {

}

exports.secondary_get = async (req, res) => {

}

exports.secondary_post = async (req, res) => {

}

exports.secondary_subject_get = async (req, res) => {

}

exports.secondary_subject_post = async (req, res) => {

}



exports.browse_get = async (req, res) => {
  if (process.env.USER_JOURNEY === 'search') {
    res.redirect('/search')
  } else {
    res.render('browse/index')
  }
}

exports.browse_post = async (req, res) => {

}

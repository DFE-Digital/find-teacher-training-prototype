module.exports = router => {
  router.get('/providers', async (req, res) => {
    res.render('providers', {
      backLink:
        req.query.referrer
          ? { href: req.query.referrer }
          : false
    })
  })
}

module.exports = router => {
  router.post('/admin/clear-data', function (req, res) {
    req.session.data = {}
    res.render('admin/clear-data-success')
  })
}

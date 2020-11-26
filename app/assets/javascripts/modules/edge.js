;(function (global) {
  'use strict'

  const GOVUK = global.GOVUK || {}
  GOVUK.Modules = GOVUK.Modules || {}

  GOVUK.Modules.Edge = function () {
    this.start = function (element) {
      element.on('click', 'a[href="#"], .js-edge', alertUser)

      function alertUser (evt) {
        evt.preventDefault()
        window.alert('Sorry, this hasn’t been built yet')
      }
    }
  }

  global.GOVUK = GOVUK
})(window)

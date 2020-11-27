;(function (global) {
  'use strict'

  const GOVUK = global.GOVUK || {}
  GOVUK.Modules = GOVUK.Modules || {}

  GOVUK.Modules.Toggle = function () {
    this.start = function (element) {
      const toggleButton = element[0].querySelector('.js-toggle')
      if (!toggleButton) {
        return
      }

      const target = element[0].querySelector('#' + toggleButton.getAttribute('aria-controls'))

      const toggleClass = function (node, className) {
        if (node.className.indexOf(className) > 0) {
          node.className = node.className.replace(' ' + className, '')
        } else {
          node.className += ' ' + className
        }
      }

      const toggle = function (e) {
        if (toggleButton && target) {
          toggleClass(target, 'govuk-toggle__target--open')
          toggleClass(toggleButton, 'govuk-toggle__link--open')

          toggleButton.setAttribute('aria-expanded', toggleButton.getAttribute('aria-expanded') !== 'true')
          target.setAttribute('aria-hidden', target.getAttribute('aria-hidden') === 'false')
        }
      }

      toggleButton.addEventListener('click', toggle)
    }
  }

  global.GOVUK = GOVUK
})(window)

/* global $ */
import { initAll } from '/node_modules/govuk-frontend/dist/govuk/govuk-frontend.min.js'

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  initAll()
})

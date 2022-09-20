/* global $ */
import { CheckboxFilter } from './components/checkbox-filter.js'
import { FilterToggleButton } from './components/filter-toggle-button.js'

const checkboxFilter = new CheckboxFilter({
  container: $('#subject'),
  textBox: {
    label: 'Search for subject'
  }
})

const filterToggleButton = new FilterToggleButton({
  bigModeMediaQuery: '(min-width: 48.063em)',
  startHidden: false,
  toggleButton: {
    container: $('.app-filter-toggle'),
    showText: 'Show filters',
    hideText: 'Hide filters',
    classes: 'govuk-button--secondary'
  },
  closeButton: {
    container: $('.app-filter__header'),
    text: 'Close'
  },
  filter: {
    container: $('.app-filter-layout__filter')
  }
})

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

$(document).ready(function () {
  GOVUK.modules.start()
  checkboxFilter.init()
  filterToggleButton.init()
  window.GOVUKFrontend.initAll()
})

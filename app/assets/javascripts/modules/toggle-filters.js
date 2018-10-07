;(function (global) {
  'use strict'

  var GOVUK = global.GOVUK || {}
  GOVUK.Modules = GOVUK.Modules || {}

  GOVUK.Modules.ToggleFilters = function () {
    this.start = function (element) {
      element.on('click', toggle);

      if (element.is(':visible')) {
        $('#filter-sidebar').hide();
      }

      function toggle(evt) {
        evt.preventDefault();
        element.toggleClass('filter-category--toggle-open');
        $('#filter-sidebar').toggle();
      }
    }
  }

  global.GOVUK = GOVUK
})(window)

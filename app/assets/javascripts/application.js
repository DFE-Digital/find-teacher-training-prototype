/* global $ */
import { FilterToggleButton } from './components/filter-toggle-button.js'

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
  filterToggleButton.init()
  window.GOVUKFrontend.initAll()
})

export const getPath = (endpoint, query) => {
  return `${endpoint}?query=${query}`;
}

export const request = endpoint => {
  let xhr = null; // Hoist this call so that we can abort previous requests.

  return (query, callback) => {
    if (xhr && xhr.readyState !== XMLHttpRequest.DONE) {
      xhr.abort();
    }
    const path = getPath(endpoint, query);

    xhr = new XMLHttpRequest();
    xhr.addEventListener("load", evt => {
      let results = [];
      try {
        results = JSON.parse(xhr.responseText);
      } catch (err) {
        console.error(
          `Failed to parse results from endpoint ${path}, error is:`,
          err
        );
      }
      callback(results);
    });
    xhr.open("GET", path);
    xhr.send();
  };
};



const initAutocomplete = ({element, input, path, selectNameAndCode}) => {
  const $input = document.getElementById(input);
  const $el = document.getElementById(element);
  const inputValueTemplate = result => (typeof result === "string" ? result : result && result.name);
  const suggestionTemplate = result =>
    typeof result === "string" ? result : result && `${result.name} (${result.code})`;

  console.log($input)
  try {
    if($input) {
      accessibleAutocomplete({
        element: $el,
        id: $input.id,
        showNoOptionsFound: true,
        name: $input.name,
        defaultValue: $input.value,
        minLength: 3,
        source: request(path),
        templates: {
          inputValue: selectNameAndCode ? suggestionTemplate : inputValueTemplate,
          suggestion: suggestionTemplate
        },
        onConfirm: option => ($input.value = option ? option.code : ""),
        confirmOnBlur: false
      });

      $input.parentNode.removeChild($input);
    }
  } catch(err) {
    console.error("Failed to initialise provider autocomplete:", err);
  }
};

export default initAutocomplete;

document.addEventListener('DOMContentLoaded', function() {

  initAutocomplete({
    element: "location-autocomplete",
    input: "location",
    path: "/location-suggestions",
  });
})

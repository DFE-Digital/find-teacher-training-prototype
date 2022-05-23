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

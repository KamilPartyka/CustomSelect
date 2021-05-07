import Select from './select.js';

const selectElement = document.querySelectorAll('[data-custom-select]');

selectElement.forEach((element) => {
  new Select(element);
});

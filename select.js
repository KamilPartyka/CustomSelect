export default class Select {
  constructor(element) {
    this.element = element;
    this.options = getFormattedOptions(element.querySelectorAll('option')); // acces to options in 'select'
    this.customElement = document.createElement('div'); // container
    this.labelElement = document.createElement('span'); // selected value
    this.optionCustomElement = document.createElement('ul'); // list of options

    setupCustomElement(this);

    element.style.display = 'none'; // hide default 'select' and..
    element.after(this.customElement); // ..put custom in "his place"
  }
  // find selected option
  get selectedOption() {
    return this.options.find((option) => option.selected);
  }

  get selectedOptionIndex() {
    return this.options.indexOf(this.selectedOption);
  }

  selectValue(value) {
    const newSelectedOption = this.options.find((option) => {
      return option.value === value;
    });

    // cancel select on the default element
    const prevSelectedOption = this.selectedOption;
    prevSelectedOption.selected = false;
    prevSelectedOption.element.selected = false;

    // set select on the custom select
    newSelectedOption.selected = true;
    newSelectedOption.element.selected = true;

    this.labelElement.innerText = newSelectedOption.label;

    this.optionCustomElement
      .querySelector(`[data-value="${prevSelectedOption.value}"]`)
      .classList.remove('selected');
    const newCustomElement = this.optionCustomElement.querySelector(
      `[data-value="${newSelectedOption.value}"]`
    );
    newCustomElement.classList.add('selected');
    newCustomElement.scrollIntoView({ block: 'nearest' });
  }
}

// functions outside constrictor, not expose for enduser
const setupCustomElement = (select) => {
  const {
    customElement,
    labelElement,
    optionCustomElement,
    options,
    selectedOption,
  } = select;

  customElement.classList.add('_CS-container');
  customElement.tabIndex = 0; // allow div element do be focus (on click and tab)

  labelElement.classList.add('_CS-value');
  labelElement.innerText = selectedOption.label;

  customElement.append(labelElement);
  optionCustomElement.classList.add('_CS-options');

  options.forEach((option) => {
    const optionElement = document.createElement('li');
    optionElement.classList.add('_CS-option');
    optionElement.classList.toggle('selected', option.selected);
    optionElement.innerText = option.label;
    optionElement.dataset.value = option.value; // set [data-value] in custom element
    optionCustomElement.append(optionElement);

    optionElement.addEventListener('click', () => {
      select.selectValue(option.value);
      optionCustomElement.classList.remove('show');
    });
  });
  customElement.append(optionCustomElement);

  labelElement.addEventListener('click', () => {
    optionCustomElement.classList.toggle('show');
  });

  customElement.addEventListener('blur', () => {
    optionCustomElement.classList.remove('show');
  });

  let debounceTimeout;
  let searchTerm = '';
  customElement.addEventListener('keydown', (e) => {
    switch (e.code) {
      case 'Space':
        optionCustomElement.classList.toggle('show');
        break;

      case 'ArrowUp':
        const prevOption = options[select.selectedOptionIndex - 1];
        if (prevOption) {
          select.selectValue(prevOption.value);
        }
        break;

      case 'ArrowDown':
        const nextOption = options[select.selectedOptionIndex + 1];
        if (nextOption) {
          select.selectValue(nextOption.value);
        }
        break;

      case 'Enter':
      case 'Escape':
        optionCustomElement.classList.remove('show');
        break;

      default:
        clearTimeout(debounceTimeout); // reset timeout when typing
        searchTerm += e.key;
        debounceTimeout = setTimeout(() => {
          searchTerm = '';
        }, 500);

        const searchedOption = options.find((option) => {
          return option.label.toLowerCase().startsWith(searchTerm);
        });
        if (searchedOption) {
          select.selectValue(searchedOption.value);
        }
    }
  });
};

const getFormattedOptions = (optionsElements) => {
  // convert to array to use map()
  return [...optionsElements].map((optionElement) => {
    return {
      value: optionElement.value,
      label: optionElement.label,
      selected: optionElement.selected,
      element: optionElement, // optionElement itself
    };
  });
};

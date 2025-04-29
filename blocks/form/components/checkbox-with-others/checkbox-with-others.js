import { subscribe } from '../../rules/index.js';
import { createRadioOrCheckboxUsingEnum } from '../../util.js';

let model = null;
export default function decorate(fieldDiv, fieldJson, container, formId) {
  const otherOptionLabel = fieldJson?.properties?.otherOptionLabel || 'Other';
  subscribe(fieldDiv, formId, async (element, fieldModel) => {
    model = fieldModel;

    if (model.properties?.showOtherOption) {
      fieldModel.enum = [...(fieldModel.enum || []), 'Other'];
      fieldModel.enumNames = [...(fieldModel.enumNames || []), otherOptionLabel];
      createRadioOrCheckboxUsingEnum(fieldModel, fieldDiv);

      const otherInput = document.createElement('input');
      otherInput.type = 'text';
      otherInput.classList.add('other-input');
      otherInput.placeholder = 'Please specify';
      otherInput.style.display = 'none';

      const wrapper = document.createElement('div');
      wrapper.classList.add('field-wrapper');
      wrapper.id = 'other-input-wrapper';
      wrapper.appendChild(otherInput);
      fieldDiv.appendChild(wrapper);

      const otherCheckbox = Array.from(fieldDiv.querySelectorAll('.checkbox-wrapper input[type="checkbox"]')).find(
        checkbox => checkbox.nextElementSibling?.textContent.trim() === otherOptionLabel
      );
      if (otherCheckbox) {
        otherCheckbox.addEventListener('change', (e) => {
          otherInput.style.display = e.target.checked ? 'block' : 'none';
        });

        otherInput.addEventListener('blur', (e) => {
            const otherIndex = fieldModel.enumNames.indexOf(otherOptionLabel);
            if (otherIndex !== -1) {
                fieldModel.enum[otherIndex] = e.target.value;
            }
        });
      }
    }
  });

  return fieldDiv;
}

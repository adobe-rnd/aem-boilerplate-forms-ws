import { subscribe } from '../../rules/index.js';

export default function decorate(fieldDiv, fieldJson, container, formId) {
  const otherOptionLabel = fieldJson?.properties?.otherOptionLabel || 'Other';
  const otherOptionLabels = ['other', 'Other'];
  subscribe(fieldDiv, formId, async (element, fieldModel) => {
    const otherInput = fieldDiv.querySelector('.text-wrapper input[name*="othertextinput"]');
    if (otherInput) {
      otherInput.addEventListener('blur', (e) => {
        const checkboxField = fieldModel._children.find(child => child.fieldType === 'checkbox-group');
        if (checkboxField) {
          const otherIndex = checkboxField.enumNames.findIndex(name => otherOptionLabels.includes(name));
          if (otherIndex !== -1) {
            checkboxField.enum[otherIndex] = e.target.value;
          }
        }
      });
    }
  });
}

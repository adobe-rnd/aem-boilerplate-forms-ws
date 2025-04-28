import { Constants } from '../../../libs/constants.js';
import { subscribe } from '../../rules/index.js';

/**
 * Creates a checkbox group with an "Other" option that reveals a text input when selected.
 * @param {HTMLElement} fieldDiv - The div element that contains the fields to be decorated
 * @param {Object} fieldJson - The field configuration object
 * @param {HTMLElement} container - The container element
 * @param {string} formId - The form ID
 * @returns {HTMLElement} - The decorated fieldDiv
 */
export default async function decorate(fieldDiv, fieldJson, container, formId) {
    const wrapper = document.createElement('div');
    wrapper.className = 'cmp-checkbox-with-others';
    
    const fieldProperties = fieldJson?.properties || {};
    const options = fieldProperties.enum || [];
    const orientation = fieldProperties.orientation || 'vertical';
    const showOtherOption = fieldProperties.showOtherOption || false;
    const otherOptionLabel = fieldProperties.otherOptionLabel || 'Other';
    const otherPlaceholder = fieldProperties.otherPlaceholder || 'Please specify';
    
    wrapper.classList.add(`cmp-checkbox-with-others--${orientation}`);
    
    // Create checkboxes for regular options
    options.forEach((option, index) => {
        const checkboxWrapper = document.createElement('div');
        checkboxWrapper.className = 'cmp-checkbox-with-others__option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `${fieldDiv.id}-${index}`;
        checkbox.name = fieldJson.name;
        checkbox.value = option.value;
        checkbox.className = 'cmp-checkbox-with-others__input';
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = option.text;
        label.className = 'cmp-checkbox-with-others__label';
        
        checkboxWrapper.appendChild(checkbox);
        checkboxWrapper.appendChild(label);
        wrapper.appendChild(checkboxWrapper);
    });
    
    let otherInput;
    // Create "Other" option only if showOtherOption is true
    if (showOtherOption) {
        const otherWrapper = document.createElement('div');
        otherWrapper.className = 'cmp-checkbox-with-others__other-option';
        
        const otherCheckbox = document.createElement('input');
        otherCheckbox.type = 'checkbox';
        otherCheckbox.id = `${fieldDiv.id}-other`;
        otherCheckbox.name = fieldJson.name;
        otherCheckbox.value = 'other';
        otherCheckbox.className = 'cmp-checkbox-with-others__input';
        
        const otherLabel = document.createElement('label');
        otherLabel.htmlFor = otherCheckbox.id;
        otherLabel.textContent = otherOptionLabel;
        otherLabel.className = 'cmp-checkbox-with-others__label';
        
        otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.className = 'cmp-checkbox-with-others__other-input';
        otherInput.placeholder = otherPlaceholder;
        otherInput.style.display = 'none';
        
        otherWrapper.appendChild(otherCheckbox);
        otherWrapper.appendChild(otherLabel);
        otherWrapper.appendChild(otherInput);
        wrapper.appendChild(otherWrapper);
    }
    
    // Replace the original element with our custom implementation
    fieldDiv.innerHTML = '';
    fieldDiv.appendChild(wrapper);
    
    // Add help text if it exists
    const helpText = fieldDiv.querySelector('.field-description');
    if (helpText) {
        fieldDiv.appendChild(helpText);
    }

    // Subscribe to field model changes
    subscribe(fieldDiv, formId, async (element, fieldModel) => {
        // Handle initial value
        if (fieldModel.value) {
            const values = Array.isArray(fieldModel.value) ? fieldModel.value : [fieldModel.value];
            wrapper.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                if (checkbox.value === 'other') {
                    const otherValue = values.find(v => !options.some(opt => opt.value === v));
                    if (otherValue) {
                        checkbox.checked = true;
                        if (otherInput) {
                            otherInput.style.display = 'block';
                            otherInput.value = otherValue;
                        }
                    }
                } else {
                    checkbox.checked = values.includes(checkbox.value);
                }
            });
        }

        // Subscribe to showOtherOption changes
        fieldModel.subscribe((e) => {
            const { payload } = e;
            payload?.changes?.forEach((change) => {
                if (change?.propertyName === 'showOtherOption') {
                    if (change.currentValue) {
                        // Add "Other" to enum and enumNames
                        fieldModel.enum = [...(fieldModel.enum || []), 'other'];
                        fieldModel.enumNames = [...(fieldModel.enumNames || []), 'Others'];
                    } else {
                        // Remove "Other" from enum and enumNames
                        fieldModel.enum = fieldModel.enum.filter(v => v !== 'other');
                        fieldModel.enumNames = fieldModel.enumNames.filter(n => n !== 'Others');
                    }
                    // Re-render the component
                    decorate(fieldDiv, fieldJson, container, formId);
                }
            });
        }, 'change');

        // Add event handlers for "Other" option
        if (otherInput) {
            const otherCheckbox = wrapper.querySelector(`#${fieldDiv.id}-other`);
            otherCheckbox.addEventListener('change', (e) => {
                otherInput.style.display = e.target.checked ? 'block' : 'none';
                if (!e.target.checked) {
                    otherInput.value = '';
                    // Remove "Other" from enum and enumNames
                    fieldModel.enum = fieldModel.enum.filter(v => v !== 'other');
                    fieldModel.enumNames = fieldModel.enumNames.filter(n => n !== 'Others');
                }
            });

            otherInput.addEventListener('input', (e) => {
                if (otherCheckbox.checked) {
                    // Update enum and enumNames with the text input value
                    const value = e.target.value;
                    if (value) {
                        fieldModel.enum = [...(fieldModel.enum || []).filter(v => v !== 'other'), value];
                        fieldModel.enumNames = [...(fieldModel.enumNames || []).filter(n => n !== 'Others'), 'Others'];
                    }
                }
            });
        }

        // Subscribe to value changes
        fieldModel.subscribe((e) => {
            const { payload } = e;
            payload?.changes?.forEach((change) => {
                if (change?.propertyName === 'value') {
                    const values = Array.isArray(change.currentValue) ? change.currentValue : [change.currentValue];
                    wrapper.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
                        if (checkbox.value === 'other') {
                            const otherValue = values.find(v => !options.some(opt => opt.value === v));
                            if (otherValue) {
                                checkbox.checked = true;
                                if (otherInput) {
                                    otherInput.style.display = 'block';
                                    otherInput.value = otherValue;
                                }
                            } else {
                                checkbox.checked = false;
                                if (otherInput) {
                                    otherInput.style.display = 'none';
                                    otherInput.value = '';
                                }
                            }
                        } else {
                            checkbox.checked = values.includes(checkbox.value);
                        }
                    });
                }
            });
        }, 'change');
    });
    
    return fieldDiv;
} 
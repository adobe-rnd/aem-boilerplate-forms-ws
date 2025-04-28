import { subscribe } from '../../rules/index.js';

// Global variable to store the field model
let model = null;

/**
 * Creates a checkbox group with an "Other" option that reveals a text input when selected.
 * @param {HTMLElement} fieldDiv - The div element that contains the fields to be decorated
 * @param {Object} fieldJson - The field configuration object
 * @param {HTMLElement} container - The container element
 * @param {string} formId - The form ID
 * @returns {HTMLElement} - The decorated fieldDiv
 */
export default function decorate(fieldDiv, fieldJson, container, formId) {
    const wrapper = document.createElement('div');
    const wrapperClass = 'checkbox-wrapper-others';
    wrapper.className = wrapperClass;
    
    const fieldProperties = fieldJson?.properties || {};
    const orientation = fieldProperties.orientation || 'vertical';
    const showOtherOption = fieldProperties.showOtherOption || false;
    const otherOptionLabel = fieldProperties.otherOptionLabel || 'Other';
    
    // Store the current other value
    let currentOtherValue = '';
    
    wrapper.classList.add(`${wrapperClass}--${orientation}`);
    
    // Create text input for "Other" option
    let otherInput;

    otherInput = document.createElement('input');
    otherInput.type = 'text';
    otherInput.className = `${wrapperClass}__other-input`;
    otherInput.value = currentOtherValue;
    otherInput.style.display = 'none';
    wrapper.appendChild(otherInput);

    // Add event handlers for "Other" option
    const otherCheckbox = wrapper.querySelector(`#${fieldDiv.id}-other`);
    
    otherCheckbox.addEventListener('change', (e) => {
        otherInput.style.display = e.target.checked ? 'block' : 'none';
        if (!e.target.checked) {
            otherInput.value = currentOtherValue;
            // Remove the current other value from enum
            if (currentOtherValue) {
                model?.enum = model?.enum.filter(v => v !== currentOtherValue);
                currentOtherValue = 'Please specify';
                // Add back the default value
                model?.enum = [...(model?.enum || []), currentOtherValue];
            }
        }
    });

    otherInput.addEventListener('input', (e) => {
        if (otherCheckbox?.checked) {
            const value = e.target.value;
            if (value) {
                // Remove previous other value if exists
                if (currentOtherValue) {
                    model?.enum = model?.enum.filter(v => v !== currentOtherValue);
                }
                // Add new value to enum
                currentOtherValue = value;
                model?.enum = [...(model?.enum || []), value];
                // Keep "Others" in enumNames
                model?.enumNames = [...(model?.enumNames || []).filter(n => n !== otherOptionLabel), otherOptionLabel];
            }
        }
    });
    
    // Append our custom wrapper to the original element
    fieldDiv.appendChild(wrapper);
    
    // Subscribe to field model changes
    subscribe(fieldDiv, formId, async (element, fieldModel) => {
        // Store the field model globally
        model = fieldModel;

        // Update form model to include "Other" option if showOtherOption is true
        if (fieldModel.showOtherOption) {
            fieldModel.enum = [...(fieldModel.enum || []), currentOtherValue];
            fieldModel.enumNames = [...(fieldModel.enumNames || []), otherOptionLabel];
            // Re-decorate to let form.js create the checkbox
            decorate(fieldDiv, fieldJson, container, formId);
        }

        // Subscribe to showOtherOption changes
        fieldModel.subscribe((e) => {
            const { payload } = e;
            payload?.changes?.forEach((change) => {
                if (change?.propertyName === 'showOtherOption') {
                    if (change.currentValue) {
                        // Add currentOtherValue to enum and enumNames
                        fieldModel.enum = [...(fieldModel.enum || []), currentOtherValue];
                        fieldModel.enumNames = [...(fieldModel.enumNames || []), otherOptionLabel];
                    } else {
                        // Remove currentOtherValue from enum and enumNames
                        fieldModel.enum = fieldModel.enum.filter(v => v !== currentOtherValue);
                        fieldModel.enumNames = fieldModel.enumNames.filter(n => n !== otherOptionLabel);
                    }
                    // Re-render the component
                    decorate(fieldDiv, fieldJson, container, formId);
                }
            });
        }, 'change');
    });
    
    return fieldDiv;
} 

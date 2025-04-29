import { subscribe } from '../../rules/index.js';

let model = null;
export default function decorate(fieldDiv, fieldJson, container, formId) {
    let currentOtherValue = '';
    const otherOptionLabel = fieldJson?.properties?.otherOptionLabel || 'Other';
    subscribe(fieldDiv, formId, async (element, fieldModel) => {
        model = fieldModel;
        
        if (fieldModel.properties.showOtherOption) {
            fieldModel.enum = [...(fieldModel.enum || []), ''];
            fieldModel.enumNames = [...(fieldModel.enumNames || []), otherOptionLabel];
            
            const otherInput = document.createElement('input');
            otherInput.type = 'text';
            otherInput.classList.add('other-input');
            otherInput.style.display = 'none';
            fieldDiv.appendChild(otherInput);
            
            const otherCheckbox = fieldDiv.querySelector(`#${fieldDiv.id}-other`);
            if (otherCheckbox) {
                otherCheckbox.addEventListener('change', (e) => {
                    otherInput.style.display = e.target.checked ? 'block' : 'none';
                });
                
                otherInput.addEventListener('blur', (e) => {
                    if (otherCheckbox.checked) {
                        const otherIndex = fieldModel.enumNames.indexOf(otherOptionLabel);
                        if (otherIndex !== -1) {
                            fieldModel.enum[otherIndex] = e.target.value;
                        }
                    }
                });
            }
        }
    });
    
    return fieldDiv;
} 

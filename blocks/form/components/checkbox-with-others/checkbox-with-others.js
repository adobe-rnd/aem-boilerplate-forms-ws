import { subscribe } from '../../rules/index.js';


export default function decorate(fieldDiv, fieldJson, container, formId) {
    let currentOtherValue = 'Please specify';
    const otherOptionLabel = fieldJson?.properties?.otherOptionLabel || 'Other';
    subscribe(fieldDiv, formId, async (element, fieldModel) => {
        model = fieldModel;

        fieldModel.enum = [...(fieldModel.enum || []), currentOtherValue];
        fieldModel.enumNames = [...(fieldModel.enumNames || []), otherOptionLabel];
        
        const otherInput = document.createElement('input');
        otherInput.type = 'text';
        otherInput.classList.add('other-input');
        otherInput.placeholder = 'Enter other value...';
        
        // Add change listener to update the model
        otherInput.addEventListener('blur', (e) => {
           
        });
        fieldDiv.appendChild(otherInput);
    });
    
    return fieldDiv;
} 

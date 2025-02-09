"use strict";

// Imports - grouped and ordered
import { LLMErrors, handleLLMError } from "./llm_errors.js";
import LLMStorage from "./llm_storage.js";

// Constants
const OPERATION_DELAY = 800; // Simulated API call time

/**
 * UI Elements initialization
 */
function initializeUIElements() {
    return {
        saveButton: document.getElementById('judge0-save-api-key'),
        deleteButton: document.getElementById('judge0-delete-api-key'),
        apiKeyInput: document.getElementById('judge0-api-key'),
        providerSelect: document.getElementById('judge0-llm-provider'),
        messageContainer: document.getElementById('judge0-api-message')
    };
}

/**
 * UI State Management
 */
function setUILoadingState(elements, isLoading, actionType = 'save') {
    const { saveButton, deleteButton, apiKeyInput, providerSelect } = elements;
    
    if (actionType === 'save') {
        $(saveButton).toggleClass("loading", isLoading);
        $(deleteButton).toggleClass("disabled", isLoading);
    } else {
        $(deleteButton).toggleClass("loading", isLoading);
        $(saveButton).toggleClass("disabled", isLoading);
    }

    // Disable inputs regardless of action type
    $(apiKeyInput).prop('disabled', isLoading);
    $(providerSelect).closest('.dropdown').toggleClass('disabled', isLoading);
}

/**
 * Message Display
 */
function showMessage(message, isError = false) {
    const { messageContainer } = initializeUIElements();
    messageContainer.textContent = message;
    messageContainer.classList.remove('hidden', 'success', 'error');
    messageContainer.classList.add(isError ? 'error' : 'success');
    
    setTimeout(() => {
        messageContainer.classList.add('hidden');
    }, 3000);
}

/**
 * Event Handlers
 */
async function handleSave(elements) {
    const { apiKeyInput, providerSelect } = elements;
    const apiKey = apiKeyInput.value.trim();
    const selectedProvider = providerSelect.value;

    // Validation
    if (!selectedProvider) {
        showMessage(LLMErrors.VALIDATION.EMPTY_PROVIDER, true);
        return;
    }

    if (!apiKey) {
        showMessage(LLMErrors.VALIDATION.EMPTY_KEY, true);
        return;
    }

    setUILoadingState(elements, true, 'save');

    try {
        await new Promise(resolve => setTimeout(resolve, OPERATION_DELAY));
        await LLMStorage.storeApiKey(selectedProvider, apiKey);
        showMessage(LLMErrors.SUCCESS.SAVE);
        apiKeyInput.value = '';
    } catch (error) {
        showMessage(handleLLMError(error, 'OPERATION'), true);
    } finally {
        setUILoadingState(elements, false), 'save';
    }
}

async function handleDelete(elements) {
    const { apiKeyInput, providerSelect } = elements;
    const selectedProvider = providerSelect.value;

    if (!selectedProvider) {
        showMessage(LLMErrors.VALIDATION.EMPTY_PROVIDER, true);
        return;
    }

    if (!LLMStorage.hasApiKey(selectedProvider)) {
        showMessage(LLMErrors.OPERATION.KEY_NOT_FOUND, true);
        return;
    }

    if (!confirm('Are you sure you want to delete this API key?')) {
        return;
    }

    setUILoadingState(elements, true, 'delete');

    try {
        await new Promise(resolve => setTimeout(resolve, OPERATION_DELAY));
        await LLMStorage.deleteApiKey(selectedProvider);
        showMessage(LLMErrors.SUCCESS.DELETE);
        apiKeyInput.value = '';
    } catch (error) {
        showMessage(handleLLMError(error, 'STORAGE'), true);
    } finally {
        setUILoadingState(elements, false, 'delete');
    }
}

/**
 * Main Initialization
 */
function initializeLLMControls() {
    const elements = initializeUIElements();

    $('#judge0-llm-provider').dropdown({
        fullTextSearch: true
    });

    
    // Event Listeners
    elements.saveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleSave(elements);
    });

    elements.deleteButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleDelete(elements);
    });
}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initializeLLMControls);

// Export if needed by other modules
export { initializeLLMControls };
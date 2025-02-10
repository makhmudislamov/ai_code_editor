"use strict";

// Imports - grouped and ordered
import { LLMErrors, handleLLMError } from "./llm_errors.js";
import LLMStorage from "./llm_storage.js";
import { llmApi } from './llm_api.js';
import { sourceEditor } from './ide.js';


// Constants
const OPERATION_DELAY = 800; // Simulated API call time


// NEW CHANGE: Chat loading state
function setLoading(isLoading) {
    const elements = initializeUIElements();
    $(elements.chatForm).toggleClass("loading", isLoading);
    $(elements.chatInput).prop('disabled', isLoading);
}

// NEW CHANGE: Display chat messages
function displayChatMessage(message) {
    const elements = initializeUIElements();
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('ui', 'small', 'segment', 'judge0-message');
    messageDiv.textContent = message;
    elements.chatMessages.appendChild(messageDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// NEW CHANGE: Display code fix suggestions
function displayCodeFix(fixSuggestion) {
    const elements = initializeUIElements();
    const fixDiv = document.createElement('div');
    fixDiv.classList.add('ui', 'small', 'segment', 'judge0-message', 'code-fix');
    fixDiv.innerHTML = marked.parse(fixSuggestion); // Use marked for code formatting
    elements.chatMessages.appendChild(fixDiv);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

// NEW CHANGE: Get current language
function getCurrentLanguage() {
    const languageSelect = document.getElementById('select-language');
    return languageSelect ? languageSelect.options[languageSelect.selectedIndex].text : 'unknown';
}


// NEW CHANGE: Error display
function showError(message) {
    showMessage(message, true);
}

/**
 * UI Elements initialization
 */
function initializeUIElements() {
    return {
        saveButton: document.getElementById('judge0-save-api-key'),
        deleteButton: document.getElementById('judge0-delete-api-key'),
        apiKeyInput: document.getElementById('judge0-api-key'),
        providerSelect: document.getElementById('judge0-llm-provider'),
        messageContainer: document.getElementById('judge0-api-message'),
        // NEW CHANGE: Add chat elements
        chatForm: document.getElementById('judge0-chat-form'),
        chatInput: document.getElementById('judge0-chat-user-input'),
        chatMessages: document.getElementById('judge0-chat-messages')
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

    // NEW CHANGE: Check if chat form exists
    // if (elements.chatForm) {
    //     elements.chatForm.addEventListener('submit', async (e) => {
    //         e.preventDefault();
            
    //         // NEW CHANGE: Check if elements exist before accessing
    //         if (!elements.chatInput || !elements.providerSelect) {
    //             console.error('Chat elements not found');
    //             return;
    //         }

    //         const message = elements.chatInput.value;
    //         const selectedModel = elements.providerSelect.value;

    //         try {
    //             setLoading(true);
    //             // NEW CHANGE: Use actual API call instead of placeholder
    //             const response = await llmApi.sendChatMessage(message, selectedModel);
    //             displayChatMessage(response.data);
    //             elements.chatInput.value = ''; // Clear input after sending
    //         } catch (error) {
    //             showError(error.message);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }, { passive: false }); // NEW CHANGE: Add passive: false
    // }


    // Event Listeners
    elements.saveButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleSave(elements);
    });

    elements.deleteButton.addEventListener('click', async (e) => {
        e.preventDefault();
        await handleDelete(elements);
    });

    // elements.chatForm.addEventListener('submit', async (e) => {
    //     e.preventDefault();
    //     const message = elements.chatInput.value;
    //     const selectedModel = elements.modelSelect.value;

    //     try {
    //         setLoading(true);
    //         const response = await llmApi.sendChatMessage(message, selectedModel);
    //         displayChatMessage(response.data);
    //     } catch (error) {
    //         showError(error.message);
    //     } finally {
    //         setLoading(false);
    //     }
    // });

    // Code fix handler (when compilation fails)
    window.handleCompilationError = async (error) => {
        const code = sourceEditor.getValue();
        const language = getCurrentLanguage();
        const selectedModel = elements.modelSelect.value;

        try {
            setLoading(true);
            const response = await llmApi.getCodeFix(code, error, language, selectedModel);
            displayCodeFix(response.data);
        } catch (error) {
            showError(error.message);
        } finally {
            setLoading(false);
        }
    };



}

// Initialize on DOM load
document.addEventListener("DOMContentLoaded", initializeLLMControls);

// Export if needed by other modules
export { initializeLLMControls };
"use strict";

import ls from "./local_storage.js";
import LLMSecurity from "./llm_security.js";
import LLMStorage from "./llm_storage.js";
import { LLMErrors, handleLLMError } from "./llm_errors.js";

// Storage and Security Constants
const STORAGE_PREFIX = "judge0_llm_";
const STORAGE_VERSION = "v1"; // For future compatibility

// LLM Provider configurations 
const LLM_PROVIDERS = [
    {
        id: "openai-gpt-4o",
        name: "GPT-4o",
        provider: "OpenAI",
        keyPattern: /^sk-[A-Za-z0-9]{32,}$/ // OpenAI key pattern
    },
    {
        id: "openai-gpt-4o-mini",
        name: "GPT-4o mini",
        provider: "OpenAI",
        keyPattern: /^sk-[A-Za-z0-9]{32,}$/
    },
    {
        id: "openai-o1",
        name: "o1",
        provider: "OpenAI",
        keyPattern: /^sk-[A-Za-z0-9]{32,}$/
    },
    {
        id: "claude-sonnet",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        keyPattern: /^sk-ant-[A-Za-z0-9]{32,}$/ // Anthropic key pattern
    },
    {
        id: "claude-haiku",
        name: "Claude 3.5 Haiku",
        provider: "Anthropic",
        keyPattern: /^sk-ant-[A-Za-z0-9]{32,}$/
    }
];


// Helper function to generate storage key
function getStorageKey(providerId) {
    return `${STORAGE_PREFIX}${STORAGE_VERSION}_${providerId}`;
}

// Initialize LLM dropdown (this was missing)
function initializeLLMDropdown() {
    const $selectLLM = $("#judge0-llm-provider");
    
    // Clear existing options except placeholder
    $selectLLM.find('option:not([value=""])').remove();
    
    // Add providers
    const options = LLM_PROVIDERS.map(provider => 
        new Option(provider.name, provider.id)
    );
    
    // Append to dropdown
    $selectLLM.append(options);
    
    // Initialize Semantic UI dropdown
    $selectLLM.dropdown({
        fullTextSearch: true,
        onChange: function(value) {
            console.log("Selected LLM:", value);
        }
    });
}

function initializeLLMControls() {
    const saveButton = document.getElementById('judge0-save-api-key');
    const apiKeyInput = document.getElementById('judge0-api-key');
    const providerSelect = document.getElementById('judge0-llm-provider');
    const messageContainer = document.getElementById('judge0-api-message');
    const deleteButton = document.getElementById('judge0-delete-api-key');

    

    // Function to show message
    function showMessage(message, isError = false) {
        messageContainer.textContent = message;
        messageContainer.classList.remove('hidden', 'success', 'error');
        messageContainer.classList.add(isError ? 'error' : 'success');
        
        setTimeout(() => {
            messageContainer.classList.add('hidden');
        }, 3000);
    }

    // Function to set loading state
    function setLoading(isLoading) {
        // Add loading class and disable buttons
        if (isLoading) {
            saveButton.classList.add('loading', 'disabled');
            deleteButton.classList.add('loading', 'disabled');
            // Add Semantic UI's disabled class
            providerSelect.closest('.dropdown').classList.add('disabled');
        } else {
            saveButton.classList.remove('loading', 'disabled');
            deleteButton.classList.remove('loading', 'disabled');
            providerSelect.closest('.dropdown').classList.remove('disabled');
        }
    
        // Explicitly set disabled attribute
        saveButton.disabled = isLoading;
        deleteButton.disabled = isLoading;
        apiKeyInput.disabled = isLoading;
        providerSelect.disabled = isLoading;
    
        // Prevent any clicks during loading
        if (isLoading) {
            const container = document.getElementById('judge0-llm-config');
            container.style.pointerEvents = 'none';
        } else {
            const container = document.getElementById('judge0-llm-config');
            container.style.pointerEvents = 'auto';
        }
    }

    // Save button handler
    saveButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
        const apiKey = apiKeyInput.value.trim();
        const selectedProvider = providerSelect.value;

        // Validation with new error messages
        if (!selectedProvider) {
            showMessage(LLMErrors.VALIDATION.EMPTY_PROVIDER, true);
            return;
        }

        if (!apiKey) {
            showMessage(LLMErrors.VALIDATION.EMPTY_KEY, true);
            return;
        }

        // Loading state
        $(saveButton).addClass("loading");
        $(deleteButton).addClass("disabled");
        $(apiKeyInput).prop('disabled', true);
        $(providerSelect).closest('.dropdown').addClass('disabled');

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            await LLMStorage.storeApiKey(selectedProvider, apiKey);
            showMessage(LLMErrors.SUCCESS.SAVE);
            apiKeyInput.value = '';
        } catch (error) {
            showMessage(handleLLMError(error, 'OPERATION'), true);
        } finally {
            $(saveButton).removeClass("loading");
            $(deleteButton).removeClass("disabled");
            $(apiKeyInput).prop('disabled', false);
            $(providerSelect).closest('.dropdown').removeClass('disabled');
        }
    });

    // Delete button handler
    deleteButton.addEventListener('click', async function(e) {
        e.preventDefault();
        
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

        $(deleteButton).addClass("loading");
        $(saveButton).addClass("disabled");
        $(apiKeyInput).prop('disabled', true);
        $(providerSelect).closest('.dropdown').addClass('disabled');

        try {
            await LLMStorage.deleteApiKey(selectedProvider);
            showMessage(LLMErrors.SUCCESS.DELETE);
            apiKeyInput.value = '';
        } catch (error) {
            showMessage(handleLLMError(error, 'STORAGE'), true);
        } finally {
            $(deleteButton).removeClass("loading");
            $(saveButton).removeClass("disabled");
            $(apiKeyInput).prop('disabled', false);
            $(providerSelect).closest('.dropdown').removeClass('disabled');
        }
    });

    // Clear message when input changes
    apiKeyInput.addEventListener('input', () => {
        messageContainer.classList.add('hidden');
    });

    providerSelect.addEventListener('change', () => {
        messageContainer.classList.add('hidden');
    });
}

// Add to DOMContentLoaded
document.addEventListener("DOMContentLoaded", function () {
    // Existing initialization
    initializeLLMDropdown();
    
    // Add new initialization
    initializeLLMControls();
});


// Export existing and new functionality
export { 
    initializeLLMDropdown, 
    LLM_PROVIDERS,
    LLMErrors,
    getStorageKey
};

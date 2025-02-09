"use strict";

/**
 * LLM Error and Message Constants
 */
const LLMErrors = {
    // Validation Errors
    VALIDATION: {
        EMPTY_PROVIDER: "Please select a provider",
        EMPTY_KEY: "Please enter an API key",
        INVALID_KEY_FORMAT: {
            openai: "Invalid OpenAI API key format",
            claude: "Invalid Claude API key format",
        }
    },

    // Operation Errors
    OPERATION: {
        SAVE_FAILED: "Failed to save API key",
        DELETE_FAILED: "Failed to delete API key",
        KEY_NOT_FOUND: "No API key found for selected provider"
    },

    // Storage Errors
    STORAGE: {
        DELETE_FAILED: "Unable to remove API key"
    },

    // Success Messages
    SUCCESS: {
        SAVE: "API key saved successfully",
        DELETE: "API key deleted successfully"
    }
};

/**
 * Error Handler
 * @param {Error|string} error - Error object or message
 * @param {string} type - Error type (VALIDATION|OPERATION|STORAGE)
 * @returns {string} User-friendly error message
 */
function handleLLMError(error, type) {
    if (typeof error === 'string') {
        return LLMErrors[type]?.[error] || error;
    }
    return error.message || LLMErrors.OPERATION.SAVE_FAILED;
}

export { LLMErrors, handleLLMError };
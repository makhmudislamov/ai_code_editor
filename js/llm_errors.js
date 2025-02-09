"use strict";

// Error message constants
const LLMErrors = {
    // Validation Errors
    VALIDATION: {
        EMPTY_PROVIDER: "Please select a provider",
        EMPTY_KEY: "Please enter an API key",
        INVALID_KEY_FORMAT: {
            'openai': "Invalid OpenAI API key format. Should start with 'sk-'",
            'claude': "Invalid Claude API key format. Should start with 'sk-ant-'",
            DEFAULT: "Invalid API key format"
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
        WRITE_FAILED: "Unable to store API key securely",
        READ_FAILED: "Unable to retrieve API key",
        DELETE_FAILED: "Unable to remove API key"
    },

    // Success Messages
    SUCCESS: {
        SAVE: "API key saved successfully",
        DELETE: "API key deleted successfully"
    }
};

// Error handler function
function handleLLMError(error, type) {
    if (typeof error === 'string') {
        return LLMErrors[type]?.[error] || error;
    }
    return error.message || LLMErrors.OPERATION.DEFAULT;
}

export { LLMErrors, handleLLMError };
"use strict";

import ls from "./local_storage.js";
import { LLMErrors } from "./llm_errors.js";

const ValidationErrors = {
    INVALID_FORMAT: "Invalid API key format",
    INVALID_PROVIDER: "Invalid provider ID",
    EMPTY_KEY: "API key cannot be empty",
};

// Key format patterns for each provider
const KEY_PATTERNS = {
    'openai-gpt-4o': /^sk-[A-Za-z0-9]{32,}$/,
    'openai-gpt-4o-mini': /^sk-[A-Za-z0-9]{32,}$/,
    'openai-o1': /^sk-[A-Za-z0-9]{32,}$/,
    'claude-sonnet': /^sk-ant-[A-Za-z0-9]{32,}$/,
    'claude-haiku': /^sk-ant-[A-Za-z0-9]{32,}$/
};

const LLMStorage = {
    // Validate API key format
    validateApiKey(providerId, apiKey) {
        if (!apiKey || apiKey.trim() === '') {
            throw new Error(LLMErrors.VALIDATION.EMPTY_KEY);
        }

        // Provider-specific validation
        if (providerId.includes('openai')) {
            if (!apiKey.startsWith('sk-')) {
                throw new Error(LLMErrors.VALIDATION.INVALID_KEY_FORMAT.openai);
            }
        } else if (providerId.includes('claude')) {
            if (!apiKey.startsWith('sk-ant-')) {
                throw new Error(LLMErrors.VALIDATION.INVALID_KEY_FORMAT.claude);
            }
        }

        return true;
    },

    // Store API key with validation
    storeApiKey(providerId, apiKey) {
        try {
            // Validate before storing
            this.validateApiKey(providerId, apiKey);

            const storageKey = `judge0_llm_v1_${providerId}`;
            ls.set(storageKey, apiKey);
            return true;
        } catch (error) {
            console.error('Storage failed:', error.message);
            throw error; // Re-throw for UI handling
        }
    },

    // Existing methods...
    getApiKey(providerId) {
        try {
            const storageKey = `judge0_llm_v1_${providerId}`;
            return ls.get(storageKey);
        } catch (error) {
            console.error('Retrieval failed:', error);
            return null;
        }
    },

    deleteApiKey(providerId) {
        try {
            const storageKey = `judge0_llm_v1_${providerId}`;
            ls.del(storageKey);
            return true;
        } catch (error) {
            console.error('Deletion failed:', error);
            return false;
        }
    },

    hasApiKey(providerId) {
        const storageKey = `judge0_llm_v1_${providerId}`;
        return ls.get(storageKey) !== null;
    }
};



export default LLMStorage;
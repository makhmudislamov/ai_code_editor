"use strict";

import ls from "./local_storage.js";
import { LLMErrors } from "./llm_errors.js";

/**
 * Key format validation patterns
 */
const KEY_PATTERNS = {
    openai: /^sk-[A-Za-z0-9]{32,}$/,
    claude: /^sk-ant-[A-Za-z0-9]{32,}$/
};

/**
 * LLM Storage Management
 */
const LLMStorage = {
    /**
     * Validate API key format
     */
    validateApiKey(providerId, apiKey) {
        // Check for empty key
        if (!apiKey?.trim()) {
            throw new Error(LLMErrors.VALIDATION.EMPTY_KEY);
        }

        // Determine provider type and validate format
        const providerType = providerId.includes('claude') ? 'claude' : 'openai';
        const pattern = KEY_PATTERNS[providerType];

        if (!pattern.test(apiKey)) {
            throw new Error(LLMErrors.VALIDATION.INVALID_KEY_FORMAT[providerType]);
        }

        return true;
    },

    /**
     * Store API key
     */
    async storeApiKey(providerId, apiKey) {
        try {
            this.validateApiKey(providerId, apiKey);
            const storageKey = this.getStorageKey(providerId);
            ls.set(storageKey, apiKey);
            return true;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Retrieve API key
     */
    getApiKey(providerId) {
        try {
            const storageKey = this.getStorageKey(providerId);
            const key = ls.get(storageKey);
            
            if (!key) {
                throw new Error(LLMErrors.OPERATION.KEY_NOT_FOUND);
            }
            
            return key;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete API key
     */
    deleteApiKey(providerId) {
        try {
            const storageKey = this.getStorageKey(providerId);
            ls.del(storageKey);
            return true;
        } catch (error) {
            throw new Error(LLMErrors.STORAGE.DELETE_FAILED);
        }
    },

    /**
     * Check if key exists
     */
    hasApiKey(providerId) {
        const storageKey = this.getStorageKey(providerId);
        return ls.get(storageKey) !== null;
    },

    /**
     * Generate storage key
     */
    getStorageKey(providerId) {
        return `judge0_llm_v1_${providerId}`;
    }
};

export default LLMStorage;
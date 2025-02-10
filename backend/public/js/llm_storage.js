"use strict";

import ls from "./local_storage.js";
import { LLMErrors } from "./llm_errors.js";
import cryptoHandler from "./llm_crypto.js";

/**
 * Key format validation patterns
 */
// const KEY_PATTERNS = {
//     openai: /^sk-[A-Za-z0-9]{32,}$/,
//     claude: /^sk-ant-[A-Za-z0-9]{32,}$/
// };

// const KEY_PATTERNS = {
//     openai: /^sk-[A-Za-z0-9_\-]{32,}$/,  // allow longer keys and more characters
//     claude: /^sk-ant-[A-Za-z0-9_\-]{32,}$/
// };

const KEY_PATTERNS = {
    openai: /^sk-.*$/,  // Accept any key that starts with sk-
    claude: /^sk-ant-.*$/
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
     * Store API key with encryption
     */
    async storeApiKey(providerId, apiKey) {
        try {
            // Validate first
            this.validateApiKey(providerId, apiKey);
            
            // Encrypt
            const encryptedKey = await cryptoHandler.encrypt(apiKey);
            
            // Store encrypted key
            const storageKey = this.getStorageKey(providerId);
            ls.set(storageKey, encryptedKey);
            
            return true;
        } catch (error) {
            console.error('Storage failed:', error);
            throw error;
        }
    },

    /**
     * Retrieve and decrypt API key
     */
    async getApiKey(providerId) {
        try {
            const storageKey = this.getStorageKey(providerId);
            const encryptedKey = ls.get(storageKey);
            
            if (!encryptedKey) {
                throw new Error(LLMErrors.OPERATION.KEY_NOT_FOUND);
            }
            
            // Decrypt and return
            return await cryptoHandler.decrypt(encryptedKey);
        } catch (error) {
            console.error('Retrieval failed:', error);
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
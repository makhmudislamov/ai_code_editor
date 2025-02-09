"use strict";



// Use Web Crypto API for secure encryption
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Initialize crypto key
let cryptoKey = null;

// Security utility functions
const LLMSecurity = {
    // Initialize crypto key
    async initialize() {
        try {
            const keyData = crypto.getRandomValues(new Uint8Array(32));
            cryptoKey = await crypto.subtle.importKey(
                'raw',
                keyData,
                { name: 'AES-GCM' },
                false,
                ['encrypt', 'decrypt']
            );
            return true;
        } catch (error) {
            console.error('Failed to initialize crypto:', error);
            throw new Error('ENCRYPTION_SETUP_FAILED');
        }
    },

    // Get crypto key, initialize if needed
    async getCryptoKey() {
        if (!cryptoKey) {
            await this.initialize();
        }
        return cryptoKey;
    },

    // Encrypt API key
    async encryptKey(apiKey) {
        try {
            const key = await this.getCryptoKey();
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encodedKey = encoder.encode(apiKey);

            const encryptedData = await crypto.subtle.encrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                encodedKey
            );

            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + new Uint8Array(encryptedData).length);
            combined.set(iv);
            combined.set(new Uint8Array(encryptedData), iv.length);

            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('ENCRYPTION_FAILED');
        }
    },

    // Decrypt API key
    async decryptKey(encryptedData) {
        try {
            const key = await this.getCryptoKey();
            const combined = new Uint8Array(atob(encryptedData).split('').map(char => char.charCodeAt(0)));
            
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decryptedData = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                data
            );

            return decoder.decode(decryptedData);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('DECRYPTION_FAILED');
        }
    },

    // Validate API key format
    validateKeyFormat(apiKey, provider) {
        if (!provider.keyPattern) {
            throw new Error('INVALID_PROVIDER');
        }
        return provider.keyPattern.test(apiKey);
    },

    // Sanitize input
    sanitizeInput(input) {
        return input.replace(/[<>]/g, '');
    }
};

// Initialize crypto when module loads
LLMSecurity.initialize().catch(console.error);

export default LLMSecurity;
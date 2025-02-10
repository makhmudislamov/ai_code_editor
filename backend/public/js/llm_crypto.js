"use strict";

class LLMCrypto {
    constructor() {
        // Generate a random key for the session
        if (!sessionStorage.getItem('encryptionKey')) {
            const randomKey = CryptoJS.lib.WordArray.random(32);
            sessionStorage.setItem('encryptionKey', randomKey.toString());
        }
    }

    async encrypt(text) {
        try {
            const key = sessionStorage.getItem('encryptionKey');
            const encrypted = CryptoJS.AES.encrypt(text, key).toString();
            return encrypted;
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    async decrypt(encryptedText) {
        try {
            const key = sessionStorage.getItem('encryptionKey');
            const decrypted = CryptoJS.AES.decrypt(encryptedText, key);
            return decrypted.toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data');
        }
    }
}

const cryptoHandler = new LLMCrypto();



export default cryptoHandler;
"use strict";

import LLMStorage from "./llm_storage.js";
import { LLMErrors } from "./llm_errors.js";

// frontend/js/llm_api.js
class LLMApi {
    constructor() {
        this.baseUrl = '/api';
    }

    async sendChatMessage(message, model) {
        try {
            console.log('Sending chat request:', { message, model });

            const response = await fetch(`${this.baseUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message,
                    model
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response received:', data);  // Debug log

            return data;
        } catch (error) {
            console.error('Chat Error:', error);
            throw error;
        }
    }

    async getCodeFix(code, error, language, model) {
        try {
            const response = await fetch(`${this.baseUrl}/code/fix`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    error,
                    language,
                    model
                })
            });

            if (!response.ok) {
                throw new Error('Code fix request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Code Fix Error:', error);
            throw error;
        }
    }

    async explainCode(code, language, model) {
        try {
            const response = await fetch(`${this.baseUrl}/code/explain`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    code,
                    language,
                    model
                })
            });

            if (!response.ok) {
                throw new Error('Code explanation request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Code Explanation Error:', error);
            throw error;
        }
    }
}

export const llmApi = new LLMApi();
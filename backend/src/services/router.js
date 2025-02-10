const config = require('../config');
// const fetch = require('node-fetch');

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

class OpenRouterService {
    constructor() {
        this.apiKey = config.openrouterKey;
    }

    getModelName(providerId) {
        const modelMap = {
            'openai-gpt-4o': 'openai/gpt-4o',
            'openai-gpt-4o-mini': 'openai/gpt-4o-mini',
            'openai-o1': "openai/o1",
            'claude-sonnet': 'anthropic/claude-3-sonnet',
            'claude-haiku': 'anthropic/claude-3-haiku'
        };
        return modelMap[providerId] || 'openai/gpt-4o-mini';
    }


    async sendMessage(message, providerId, codeContext = null) {
        try {
            const modelName = this.getModelName(providerId);

            // Prepare message content based on whether code context exists
            const messageContent = codeContext ? 
            `Code:\n${codeContext}\n\nQuestion: ${message}` : 
            message;

            // console.log('Router Layer:', {
            //     model: modelName,
            //     hasContext: !!codeContext,
            //     finalMessage: messageContent.substring(0, 100) + '...'
            // });


            const response = await fetch(OPENROUTER_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'HTTP-Referer': config.siteUrl,
                    'X-Title': config.siteName,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modelName,
                    messages: [
                        {
                            role: 'user',
                            content: messageContent
                        }
                    ]
                })

            });



            if (!response.ok) {
                // const errorData = await response.json();
                // console.log('OpenRouter Error Response:', errorData);
                throw new Error(`OpenRouter API Error: ${JSON.stringify(errorData)}`);
            }

            return await response.json();
        } catch (error) {
            console.error('OpenRouter API Error:', error);
            throw error;
        }
    }
}

module.exports = new OpenRouterService();
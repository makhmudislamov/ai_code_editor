const { APIError } = require('./error');

const validateChatRequest = (req, res, next) => {
    const { message, model } = req.body;

    if (!message) {
        throw new APIError('Message is required', 400);
    }

    if (!model) {
        throw new APIError('Model is required', 400);
    }

    // Validate model name
    const validModels = [
        'openai-gpt-4o',
        'openai-gpt-4o-mini',
        'openai-o1',
        'claude-sonnet',
        'claude-haiku'
    ];

    if (!validModels.includes(model)) {
        throw new APIError('Invalid model specified', 400);
    }

    next();
};

module.exports = {
    validateChatRequest
};
const express = require('express');
const router = express.Router();
const routerService = require('../services/router');
const { validateChatRequest } = require('../utils/validation');
const { APIError } = require('../utils/error');

// Regular chat endpoint (existing)
router.post('/chat', async (req, res) => {
    try {
        const { message, model } = req.body;
        // console.log('Received request:', { message, model });  // Debug log
        
        const response = await routerService.sendMessage(message, model);
        // console.log('OpenRouter response:', response);  // Debug log
        
        res.json({ success: true, data: response });
    } catch (error) {
        console.error('Route error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

// New endpoint for code error fixes
router.post('/code/fix', async (req, res, next) => {
    try {
        const { code, error, language, model } = req.body;
        const prompt = `Fix this ${language} code that has the following error: ${error}\n\nCode:\n${code}`;
        
        const response = await routerService.sendMessage(prompt, model);
        res.json({ success: true, data: response });
    } catch (error) {
        next(new APIError(error.message));
    }
});

// Code explanation endpoint
router.post('/code/explain', async (req, res, next) => {
    try {
        const { code, language, model } = req.body;
        const prompt = `Explain this ${language} code in detail:\n\n${code}`;
        
        const response = await routerService.sendMessage(prompt, model);
        res.json({ success: true, data: response });
    } catch (error) {
        next(new APIError(error.message));
    }
});

// Code optimization suggestions
router.post('/code/optimize', async (req, res, next) => {
    try {
        const { code, language, model } = req.body;
        const prompt = `Suggest optimizations for this ${language} code:\n\n${code}`;
        
        const response = await routerService.sendMessage(prompt, model);
        res.json({ success: true, data: response });
    } catch (error) {
        next(new APIError(error.message));
    }
});

module.exports = router;
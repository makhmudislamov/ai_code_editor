// backend/src/config.js
require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    openrouterKey: process.env.OPENROUTER_API_KEY,
    siteUrl: '', // Update with actual URL
    siteName: 'Judge0 IDE'
};

// Add this debug log
console.log('Config loaded:', {
    port: config.port,
    keyExists: !!config.openrouterKey, // Don't log the actual key
});

module.exports = config;
const express = require('express');
const cors = require('cors');
const config = require('./config');
const chatRoutes = require('./routes/chat');
const { errorHandler } = require('./utils/error');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());  // Add this for parsing JSON bodies
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api', chatRoutes);

// Error handling
app.use(errorHandler);

const PORT = config.port;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
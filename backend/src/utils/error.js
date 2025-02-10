class APIError extends Error {
    constructor(message, statusCode = 500, details = null) {
        super(message);
        this.statusCode = statusCode;
        this.details = details;
        this.name = 'APIError';
    }
}

const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    if (err instanceof APIError) {
        return res.status(err.statusCode).json({
            success: false,
            error: err.message,
            details: err.details
        });
    }

    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal Server Error',
        details: process.env.NODE_ENV === 'development' ? err.message : null
    });
};

module.exports = {
    APIError,
    errorHandler
};
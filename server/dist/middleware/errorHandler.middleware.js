"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = void 0;
const errors_1 = require("../shared/types/errors");
const http_constants_1 = require("../shared/constants/http.constants");
const errorHandler = (err, req, res, next) => {
    let statusCode = http_constants_1.HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error;
    if (err instanceof errors_1.AppError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    else {
        error = err.message;
    }
    if (statusCode >= 500) {
        console.error('Error:', {
            statusCode,
            message,
            error: error || err.message,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    }
    else {
        console.warn(`[${req.method}] ${req.path} - ${statusCode}: ${message}`);
    }
    const response = {
        message,
    };
    if (error) {
        response.error = error;
    }
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(http_constants_1.HTTP_STATUS.NOT_FOUND).json({
        message: `Route ${req.originalUrl} not found`,
    });
};
exports.notFoundHandler = notFoundHandler;

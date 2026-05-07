"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const http_constants_1 = require("../shared/constants/http.constants");
const errors_1 = require("../shared/types/errors");
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.AUTHORIZATION_TOKEN_MISSING);
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email
        };
        next();
    }
    catch (error) {
        if (error instanceof errors_1.UnauthorizedError) {
            next(error);
        }
        else {
            const jwtError = error;
            // Provide more specific message if it's an expiration issue
            const message = jwtError.name === 'TokenExpiredError'
                ? 'Your session has expired. Please login again.'
                : http_constants_1.HTTP_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN;
            next(new errors_1.UnauthorizedError(message));
        }
    }
};
exports.authMiddleware = authMiddleware;

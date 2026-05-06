import { Request, Response, NextFunction } from 'express';
import { AppError } from '../shared/types/errors';
import { HTTP_STATUS } from '../shared/constants/http.constants';

 
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
     
    let statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error: string | undefined;

     
    if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
    } else {
         
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
    } else {
        console.warn(`[${req.method}] ${req.path} - ${statusCode}: ${message}`);
    }

     
    interface ErrorResponse {
        message: string;
        error?: string;
        stack?: string;
    }

    const response: ErrorResponse = {
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

 
export const notFoundHandler = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
        message: `Route ${req.originalUrl} not found`,
    });
};

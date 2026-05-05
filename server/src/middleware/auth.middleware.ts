import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { HTTP_MESSAGES } from '../shared/constants/http.constants';
import { UnauthorizedError } from '../shared/types/errors';


interface JwtPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}



import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}


export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.AUTHORIZATION_TOKEN_MISSING);
    }


    const token = authHeader.split(' ')[1];


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;


    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };


    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      next(error);
    } else {
      const jwtError = error as Error;
      console.error('JWT Verification Error:', jwtError.message);
      
      // Provide more specific message if it's an expiration issue
      const message = jwtError.name === 'TokenExpiredError' 
        ? 'Your session has expired. Please login again.' 
        : HTTP_MESSAGES.AUTH.INVALID_OR_EXPIRED_TOKEN;
        
      next(new UnauthorizedError(message));
    }
  }
};

import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, linkDeviceSchema, validateDeviceSecretSchema } from '../shared/validators/auth.validator';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { container } from 'tsyringe';

import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);

// Persistent Device Flow
router.get('/devices/pair', authMiddleware, authController.getPairingToken);
router.post('/devices/link', authLimiter, validate(linkDeviceSchema), authController.linkDevice);
router.post('/devices/validate-secret', authLimiter, validate(validateDeviceSecretSchema), authController.validateDeviceSecret);

export default router;
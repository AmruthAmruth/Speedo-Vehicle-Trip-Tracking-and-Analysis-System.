import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema, registerDeviceSchema, validateDeviceSchema } from '../shared/validators/auth.validator';
import { authLimiter } from '../middleware/rateLimit.middleware';
import { container } from 'tsyringe';

const router = Router();
const authController = container.resolve(AuthController);

router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, authController.refresh);
router.post('/devices/register', authLimiter, validate(registerDeviceSchema), authController.registerDevice);
router.post('/devices/validate', authLimiter, validate(validateDeviceSchema), authController.validateDevice);

export default router;
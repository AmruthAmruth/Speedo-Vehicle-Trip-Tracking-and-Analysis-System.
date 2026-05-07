"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_validator_1 = require("../shared/validators/auth.validator");
const rateLimit_middleware_1 = require("../middleware/rateLimit.middleware");
const tsyringe_1 = require("tsyringe");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const authController = tsyringe_1.container.resolve(auth_controller_1.AuthController);
router.post('/register', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_validator_1.registerSchema), authController.register);
router.post('/login', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_validator_1.loginSchema), authController.login);
router.post('/refresh', rateLimit_middleware_1.authLimiter, authController.refresh);
// Persistent Device Flow
router.get('/devices/pair', auth_middleware_1.authMiddleware, authController.getPairingToken);
router.post('/devices/link', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_validator_1.linkDeviceSchema), authController.linkDevice);
router.post('/devices/validate-secret', rateLimit_middleware_1.authLimiter, (0, validate_middleware_1.validate)(auth_validator_1.validateDeviceSecretSchema), authController.validateDeviceSecret);
exports.default = router;

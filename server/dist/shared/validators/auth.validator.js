"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDeviceSecretSchema = exports.linkDeviceSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email address'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.linkDeviceSchema = zod_1.z.object({
    body: zod_1.z.object({
        pairingToken: zod_1.z.string().min(1, 'Pairing Token is required'),
        deviceId: zod_1.z.string().min(1, 'Device ID is required'),
        deviceName: zod_1.z.string().min(1, 'Device Name is required'),
    }),
});
exports.validateDeviceSecretSchema = zod_1.z.object({
    body: zod_1.z.object({
        deviceId: zod_1.z.string().min(1, 'Device ID is required'),
        deviceSecret: zod_1.z.string().min(1, 'Device Secret is required'),
    }),
});

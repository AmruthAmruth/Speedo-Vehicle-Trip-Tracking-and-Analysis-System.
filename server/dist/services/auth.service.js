"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const jwt_util_1 = require("../shared/utils/jwt.util");
const password_util_1 = require("../shared/utils/password.util");
const http_constants_1 = require("../shared/constants/http.constants");
const errors_1 = require("../shared/types/errors");
const tsyringe_1 = require("tsyringe");
let AuthService = class AuthService {
    constructor(_userRepository, _deviceRepository, _cacheService) {
        this._userRepository = _userRepository;
        this._deviceRepository = _deviceRepository;
        this._cacheService = _cacheService;
    }
    async register(data) {
        const existingUser = await this._userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new errors_1.BadRequestError(http_constants_1.HTTP_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
        }
        const hashedPassword = await (0, password_util_1.hashPassword)(data.password);
        const user = await this._userRepository.create({
            name: data.name,
            email: data.email,
            password: hashedPassword,
            devices: []
        });
        return {
            id: user._id.toString(),
            name: user.name,
            email: user.email
        };
    }
    async login(data) {
        const user = await this._userRepository.findByEmail(data.email);
        if (!user) {
            throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.INVALID_EMAIL_OR_PASSWORD);
        }
        const isPasswordValid = await (0, password_util_1.comparePassword)(data.password, user.password);
        if (!isPasswordValid) {
            throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.INVALID_EMAIL_OR_PASSWORD);
        }
        const payload = {
            userId: user._id.toString(),
            email: user.email
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        };
    }
    async refresh(token) {
        try {
            const decoded = (0, jwt_util_1.verifyRefreshToken)(token);
            const user = await this._userRepository.findByEmail(decoded.email);
            if (!user) {
                throw new errors_1.UnauthorizedError('User not found');
            }
            const payload = {
                userId: user._id.toString(),
                email: user.email
            };
            const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
            const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
            return { accessToken, refreshToken };
        }
        catch (error) {
            throw new errors_1.UnauthorizedError('Invalid refresh token');
        }
    }
    // Persistent Device Flow
    async generatePairingToken(userId) {
        const pairingToken = crypto_1.default.randomBytes(16).toString('hex');
        // Store in cache for 5 minutes
        await this._cacheService.set(`pairing:${pairingToken}`, userId, 300);
        return { pairingToken };
    }
    async linkDevice(pairingToken, deviceId, deviceName) {
        const userId = await this._cacheService.get(`pairing:${pairingToken}`);
        if (!userId) {
            throw new errors_1.UnauthorizedError('Pairing token expired or invalid');
        }
        const deviceSecret = crypto_1.default.randomBytes(32).toString('hex');
        // Check if device already exists, update or create
        let device = await this._deviceRepository.findByDeviceId(deviceId);
        if (device) {
            await this._deviceRepository.update(deviceId, {
                deviceName,
                deviceSecret,
                owner: userId,
                status: 'active',
                lastSeen: new Date()
            });
        }
        else {
            await this._deviceRepository.create({
                deviceId,
                deviceName,
                deviceSecret,
                owner: userId,
                status: 'active',
                lastSeen: new Date()
            });
        }
        const user = await this._userRepository.findById(userId);
        if (!user) {
            throw new errors_1.UnauthorizedError('User not found');
        }
        // Clean up pairing token
        await this._cacheService.del(`pairing:${pairingToken}`);
        // Generate a temporary JWT for the initial session
        const payload = { userId, email: user.email, deviceId };
        const deviceToken = (0, jwt_util_1.generateAccessToken)(payload);
        return { deviceToken, deviceSecret };
    }
    async validateDeviceSecret(deviceId, deviceSecret) {
        const device = await this._deviceRepository.findByDeviceId(deviceId);
        if (!device || device.deviceSecret !== deviceSecret) {
            throw new errors_1.UnauthorizedError('Device not recognized or secret invalid');
        }
        const user = await this._userRepository.findById(device.owner.toString());
        if (!user) {
            throw new errors_1.UnauthorizedError('Device owner not found');
        }
        // Update last seen
        await this._deviceRepository.update(deviceId, { lastSeen: new Date() });
        const payload = {
            userId: user._id.toString(),
            email: user.email,
            deviceId: deviceId
        };
        const accessToken = (0, jwt_util_1.generateAccessToken)(payload);
        const refreshToken = (0, jwt_util_1.generateRefreshToken)(payload);
        return {
            accessToken,
            refreshToken,
            user: {
                id: user._id.toString(),
                name: user.name,
                email: user.email
            }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IUserRepository')),
    __param(1, (0, tsyringe_1.inject)('IDeviceRepository')),
    __param(2, (0, tsyringe_1.inject)('ICacheService')),
    __metadata("design:paramtypes", [Object, Object, Object])
], AuthService);

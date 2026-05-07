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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const http_constants_1 = require("../shared/constants/http.constants");
const asyncHandler_1 = require("../shared/utils/asyncHandler");
const tsyringe_1 = require("tsyringe");
let AuthController = class AuthController {
    constructor(_authService) {
        this._authService = _authService;
        this.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const user = await this._authService.register(req.body);
            res.status(http_constants_1.HTTP_STATUS.CREATED).json(user);
        });
        this.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const result = await this._authService.login(req.body);
            res.status(http_constants_1.HTTP_STATUS.OK).json(result);
        });
        this.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { refreshToken } = req.body;
            const result = await this._authService.refresh(refreshToken);
            res.status(http_constants_1.HTTP_STATUS.OK).json(result);
        });
        this.getPairingToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const userId = req.user?.userId;
            if (!userId) {
                res.status(http_constants_1.HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
                return;
            }
            const result = await this._authService.generatePairingToken(userId);
            res.status(http_constants_1.HTTP_STATUS.OK).json(result);
        });
        this.linkDevice = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { pairingToken, deviceId, deviceName } = req.body;
            const result = await this._authService.linkDevice(pairingToken, deviceId, deviceName);
            res.status(http_constants_1.HTTP_STATUS.OK).json(result);
        });
        this.validateDeviceSecret = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { deviceId, deviceSecret } = req.body;
            const result = await this._authService.validateDeviceSecret(deviceId, deviceSecret);
            res.status(http_constants_1.HTTP_STATUS.OK).json(result);
        });
    }
};
exports.AuthController = AuthController;
exports.AuthController = AuthController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IAuthService')),
    __metadata("design:paramtypes", [Object])
], AuthController);

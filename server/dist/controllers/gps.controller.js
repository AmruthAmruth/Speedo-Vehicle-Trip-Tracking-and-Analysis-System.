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
exports.GPSController = void 0;
const asyncHandler_1 = require("../shared/utils/asyncHandler");
const http_constants_1 = require("../shared/constants/http.constants");
const tsyringe_1 = require("tsyringe");
let GPSController = class GPSController {
    constructor(_queueService) {
        this._queueService = _queueService;
        this.ingestPoint = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { tripId } = req.params;
            const gpsPoint = req.body;
            // 1. Quick Validation
            if (!gpsPoint.latitude || !gpsPoint.longitude) {
                return res.status(http_constants_1.HTTP_STATUS.BAD_REQUEST).json({
                    message: http_constants_1.HTTP_MESSAGES.GPS.INVALID_DATA,
                });
            }
            // 2. Add to Queue (Producer)
            await this._queueService.addGPSJob(tripId, gpsPoint);
            // 3. Respond immediately (202 Accepted)
            res.status(http_constants_1.HTTP_STATUS.ACCEPTED).json({
                message: http_constants_1.HTTP_MESSAGES.GPS.ACCEPTED,
                tripId,
            });
        });
    }
};
exports.GPSController = GPSController;
exports.GPSController = GPSController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('IGPSQueueService')),
    __metadata("design:paramtypes", [Object])
], GPSController);

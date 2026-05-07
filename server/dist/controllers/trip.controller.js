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
exports.TripController = void 0;
const http_constants_1 = require("../shared/constants/http.constants");
const asyncHandler_1 = require("../shared/utils/asyncHandler");
const errors_1 = require("../shared/types/errors");
const tsyringe_1 = require("tsyringe");
const simulation_service_1 = require("../services/simulation.service");
let TripController = class TripController {
    constructor(_uploadService, _tripService, _gpsRepo, _simulationService) {
        this._uploadService = _uploadService;
        this._tripService = _tripService;
        this._gpsRepo = _gpsRepo;
        this._simulationService = _simulationService;
        this.startLiveTrip = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const { name, metadata } = req.body;
            const trip = await this._tripService.startLiveTrip(req.user.userId, name, metadata);
            res.status(http_constants_1.HTTP_STATUS.CREATED).json({
                message: http_constants_1.HTTP_MESSAGES.TRIP.LIVE_TRIP_STARTED,
                trip
            });
        });
        this.stopLiveTrip = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const { id } = req.params;
            const updatedTrip = await this._tripService.stopLiveTrip(req.user.userId, id);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                message: http_constants_1.HTTP_MESSAGES.TRIP.LIVE_TRIP_STOPPED,
                trip: updatedTrip
            });
        });
        this.startSimulation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this._simulationService.startSimulation(id);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                message: http_constants_1.HTTP_MESSAGES.SIMULATION.STARTED
            });
        });
        this.stopSimulation = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            const { id } = req.params;
            this._simulationService.stopSimulation(id);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                message: http_constants_1.HTTP_MESSAGES.SIMULATION.STOPPED
            });
        });
        this.uploadTrip = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            if (!req.file) {
                throw new errors_1.BadRequestError(http_constants_1.HTTP_MESSAGES.TRIP.NO_FILE_UPLOADED);
            }
            const { name } = req.body;
            try {
                const result = await this._uploadService.uploadTrip(req.user.userId, req.file.buffer, name);
                res.status(http_constants_1.HTTP_STATUS.CREATED).json({
                    message: http_constants_1.HTTP_MESSAGES.TRIP.TRIP_UPLOADED_SUCCESSFULLY,
                    tripId: result.trip._id,
                    startTime: result.trip.startTime,
                    endTime: result.trip.endTime,
                    gpsPointsProcessed: result.pointsCount
                });
            }
            catch (error) {
                if (error instanceof errors_1.CSVValidationError) {
                    throw new errors_1.CSVValidationError(error.message);
                }
                if (error instanceof Error && error.message?.includes('Invalid file type')) {
                    throw new errors_1.BadRequestError(http_constants_1.HTTP_MESSAGES.TRIP.INVALID_FILE_TYPE);
                }
                throw new errors_1.InternalServerError(http_constants_1.HTTP_MESSAGES.TRIP.FAILED_TO_UPLOAD_TRIP);
            }
        });
        this.getUserTrips = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const trips = await this._tripService.getUserTrips(req.user.userId);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                trips,
                count: trips.length
            });
        });
        this.getTripById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const { id } = req.params;
            const trip = await this._tripService.getTripById(req.user.userId, id);
            res.status(http_constants_1.HTTP_STATUS.OK).json(trip);
        });
        this.getTripGPSPoints = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const { id } = req.params;
            // Use service to verify access before fetching points
            await this._tripService.getTripById(req.user.userId, id);
            const gpsPoints = await this._gpsRepo.findByTripId(id);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                gpsPoints,
                count: gpsPoints.length
            });
        });
        this.deleteTrip = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
            if (!req.user) {
                throw new errors_1.UnauthorizedError(http_constants_1.HTTP_MESSAGES.AUTH.USER_NOT_AUTHENTICATED);
            }
            const { id } = req.params;
            await this._tripService.deleteTrip(req.user.userId, id);
            res.status(http_constants_1.HTTP_STATUS.OK).json({
                message: http_constants_1.HTTP_MESSAGES.TRIP.TRIP_DELETED
            });
        });
    }
};
exports.TripController = TripController;
exports.TripController = TripController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)('ITripUploadService')),
    __param(1, (0, tsyringe_1.inject)('ITripService')),
    __param(2, (0, tsyringe_1.inject)('IGPSPointRepository')),
    __param(3, (0, tsyringe_1.inject)('SimulationService')),
    __metadata("design:paramtypes", [Object, Object, Object, simulation_service_1.SimulationService])
], TripController);

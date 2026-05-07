"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPSPointRepository = void 0;
const GPSPoint_model_1 = require("../models/GPSPoint.model");
const tsyringe_1 = require("tsyringe");
let GPSPointRepository = class GPSPointRepository {
    async create(point) {
        const newPoint = new GPSPoint_model_1.GPSPointModel(point);
        return await newPoint.save();
    }
    async bulkCreate(points, session) {
        let result;
        if (session) {
            result = await GPSPoint_model_1.GPSPointModel.insertMany(points, { session });
        }
        else {
            result = await GPSPoint_model_1.GPSPointModel.insertMany(points);
        }
        return result;
    }
    async findByTripId(tripId) {
        return GPSPoint_model_1.GPSPointModel.find({ tripId })
            .sort({ timestamp: 1 })
            .lean();
    }
    async deleteByTripId(tripId, session) {
        await GPSPoint_model_1.GPSPointModel.deleteMany({ tripId }, { session });
    }
};
exports.GPSPointRepository = GPSPointRepository;
exports.GPSPointRepository = GPSPointRepository = __decorate([
    (0, tsyringe_1.injectable)()
], GPSPointRepository);

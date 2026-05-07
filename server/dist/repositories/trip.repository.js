"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripRepository = void 0;
const Trip_model_1 = require("../models/Trip.model");
const tsyringe_1 = require("tsyringe");
let TripRepository = class TripRepository {
    async create(data, session) {
        if (session) {
            return Trip_model_1.TripModel.create([data], { session }).then(trips => trips[0]);
        }
        return Trip_model_1.TripModel.create(data);
    }
    async findByUserId(userId) {
        return Trip_model_1.TripModel.find({ userId })
            .sort({ startTime: -1 })
            .lean();
    }
    async findById(id) {
        return Trip_model_1.TripModel.findById(id).lean();
    }
    async update(id, data, session) {
        return Trip_model_1.TripModel.findByIdAndUpdate(id, data, { new: true, session }).lean();
    }
    async delete(id, session) {
        const result = await Trip_model_1.TripModel.deleteOne({ _id: id }, { session });
        return result.deletedCount > 0;
    }
};
exports.TripRepository = TripRepository;
exports.TripRepository = TripRepository = __decorate([
    (0, tsyringe_1.injectable)()
], TripRepository);

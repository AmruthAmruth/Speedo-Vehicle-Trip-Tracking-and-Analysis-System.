"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TripModel = void 0;
const mongoose_1 = require("mongoose");
const TripSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        default: 'Trip'
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: false
    },
    totalDistance: {
        type: Number,
        default: 0
    },
    totalIdlingTime: {
        type: Number,
        default: 0
    },
    totalStoppageTime: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: false
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});
exports.TripModel = (0, mongoose_1.model)('Trip', TripSchema);

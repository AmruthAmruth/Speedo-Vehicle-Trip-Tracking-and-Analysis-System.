"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error(' MONGO_URI is not defined in .env');
            process.exit(1);
        }
        await mongoose_1.default.connect(process.env.MONGO_URI, {
            family: 4,
            connectTimeoutMS: 10000,
        });
        console.log('MongoDB connected successfully..!');
    }
    catch (error) {
        console.error('MongoDB connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;

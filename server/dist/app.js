"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const trip_routes_1 = __importDefault(require("./routes/trip.routes"));
const gps_routes_1 = __importDefault(require("./routes/gps.routes"));
const errorHandler_middleware_1 = require("./middleware/errorHandler.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const app = (0, express_1.default)();
// Trust proxy settings for Render/Cloud environments
app.set('trust proxy', 1);
const allowedOrigins = [
    'https://speedo-vehicle-trip-tracking-and-an.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
];
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.globalLimiter);
app.use('/api', auth_routes_1.default);
app.use('/trip', trip_routes_1.default);
app.use('/api/gps', gps_routes_1.default);
app.get('/', (req, res) => {
    res.send('API is running...');
});
app.use(errorHandler_middleware_1.notFoundHandler);
app.use(errorHandler_middleware_1.errorHandler);
exports.default = app;

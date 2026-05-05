import express from 'express';
import cors from 'cors';
import router from './routes/auth.routes';
import tripRouter from './routes/trip.routes';
import gpsRouter from './routes/gps.routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.middleware';

import { globalLimiter } from './middleware/rateLimit.middleware';

const app = express();

// Trust proxy settings for Render/Cloud environments
app.set('trust proxy', 1);


const allowedOrigins = [
  'https://speedo-vehicle-trip-tracking-and-an.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true
}));
app.use(express.json());

 
app.use(globalLimiter);

app.use('/api', router);
app.use('/trip', tripRouter);
app.use('/api/gps', gpsRouter);

app.get('/', (req, res) => {
  res.send('API is running...');
});

 
app.use(notFoundHandler);

 
app.use(errorHandler);

export default app;

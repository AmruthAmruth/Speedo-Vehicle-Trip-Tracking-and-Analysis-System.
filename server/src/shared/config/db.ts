import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error(' MONGO_URI is not defined in .env');
      process.exit(1);

    }
    await mongoose.connect(process.env.MONGO_URI as string, {
      family: 4,
      connectTimeoutMS: 10000,
    });
    console.log('MongoDB connected successfully..!');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};
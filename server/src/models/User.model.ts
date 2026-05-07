import { Schema, model, Document } from 'mongoose';

export interface IDevice {
  deviceId: string;
  deviceToken: string;
  deviceName: string;
  lastUsed: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  devices: IDevice[];
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    devices: [
      {
        deviceId: { type: String, required: true },
        deviceToken: { type: String, required: true },
        deviceName: { type: String, required: true },
        lastUsed: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

export const UserModel = model<IUser>('User', UserSchema);
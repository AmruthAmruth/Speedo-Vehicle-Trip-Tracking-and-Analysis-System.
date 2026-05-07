import { Schema, model, Document } from 'mongoose';

export interface IDevice extends Document {
  deviceId: string;
  deviceName: string;
  deviceSecret: string;
  owner: Schema.Types.ObjectId;
  status: 'active' | 'inactive' | 'revoked';
  lastSeen: Date;
  metadata?: Record<string, any>;
}

const DeviceSchema = new Schema<IDevice>(
  {
    deviceId: { type: String, required: true, unique: true },
    deviceName: { type: String, required: true },
    deviceSecret: { type: String, required: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'inactive', 'revoked'], default: 'active' },
    lastSeen: { type: Date, default: Date.now },
    metadata: { type: Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

export const DeviceModel = model<IDevice>('Device', DeviceSchema);

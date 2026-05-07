import { Types } from 'mongoose';
import { IDevice, DeviceModel } from '../models/Device.model';
import { IDeviceRepository } from '../interfaces/IDeviceRepository';

export class DeviceRepository implements IDeviceRepository {
  async create(deviceData: Partial<IDevice>): Promise<IDevice> {
    return await DeviceModel.create(deviceData);
  }

  async findByDeviceId(deviceId: string): Promise<IDevice | null> {
    return await DeviceModel.findOne({ deviceId, status: 'active' });
  }

  async findByOwner(ownerId: string): Promise<IDevice[]> {
    return await DeviceModel.find({ 
      owner: new Types.ObjectId(ownerId) as any, 
      status: { $ne: 'revoked' } 
    });
  }

  async update(deviceId: string, updateData: Partial<IDevice>): Promise<IDevice | null> {
    return await DeviceModel.findOneAndUpdate(
      { deviceId },
      { $set: updateData },
      { new: true }
    );
  }

  async delete(deviceId: string): Promise<boolean> {
    const result = await DeviceModel.deleteOne({ deviceId });
    return result.deletedCount > 0;
  }
}

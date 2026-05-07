import { IDevice } from '../models/Device.model';

export interface IDeviceRepository {
  create(deviceData: Partial<IDevice>): Promise<IDevice>;
  findByDeviceId(deviceId: string): Promise<IDevice | null>;
  findByOwner(ownerId: string): Promise<IDevice[]>;
  update(deviceId: string, updateData: Partial<IDevice>): Promise<IDevice | null>;
  delete(deviceId: string): Promise<boolean>;
}

import { IUser, UserModel } from '../models/User.model';
import { IUserRepository } from '../interfaces/IUserRepository';
import { injectable } from 'tsyringe';

@injectable()
export class UserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<IUser | null> {
    return UserModel.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async findByDevice(deviceId: string, deviceToken: string): Promise<IUser | null> {
    return UserModel.findOne({
      'devices.deviceId': deviceId,
      'devices.deviceToken': deviceToken
    });
  }

  async create(user: Partial<IUser>): Promise<IUser> {
    return UserModel.create(user);
  }

  async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, user, { new: true });
  }
}
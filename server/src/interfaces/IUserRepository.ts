import { IUser } from '../models/User.model';

export interface IUserRepository {
    findByEmail(email: string): Promise<IUser | null>;
    findById(id: string): Promise<IUser | null>;
    findByDevice(deviceId: string, deviceToken: string): Promise<IUser | null>;
    create(user: Partial<IUser>): Promise<IUser>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
}

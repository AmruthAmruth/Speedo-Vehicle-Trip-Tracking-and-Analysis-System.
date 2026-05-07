import crypto from 'crypto';
import { IUserRepository } from '../interfaces/IUserRepository';
import { IDeviceRepository } from '../interfaces/IDeviceRepository';
import { ICacheService } from '../interfaces/ICacheService';
import { IAuthService, RegisterDTO, LoginDTO, AuthResponse, RegisterResponse, DeviceAuthResponse } from '../interfaces/IAuthService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../shared/utils/jwt.util';
import { comparePassword, hashPassword } from '../shared/utils/password.util';
import { HTTP_MESSAGES } from '../shared/constants/http.constants';
import { BadRequestError, UnauthorizedError } from '../shared/types/errors';
import { injectable, inject } from 'tsyringe';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject('IUserRepository') private _userRepository: IUserRepository,
    @inject('IDeviceRepository') private _deviceRepository: IDeviceRepository,
    @inject('ICacheService') private _cacheService: ICacheService
  ) { }

  async register(data: RegisterDTO): Promise<RegisterResponse> {
    const existingUser = await this._userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new BadRequestError(HTTP_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this._userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
      devices: []
    });

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email
    };
  }

  async login(data: LoginDTO): Promise<AuthResponse> {
    const user = await this._userRepository.findByEmail(data.email);

    if (!user) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.INVALID_EMAIL_OR_PASSWORD);
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.password
    );

    if (!isPasswordValid) {
      throw new UnauthorizedError(HTTP_MESSAGES.AUTH.INVALID_EMAIL_OR_PASSWORD);
    }

    const payload = {
      userId: user._id.toString(),
      email: user.email
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    };
  }

  async refresh(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await this._userRepository.findByEmail(decoded.email);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      const payload = {
        userId: user._id.toString(),
        email: user.email
      };

      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return { accessToken, refreshToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  // Persistent Device Flow
  async generatePairingToken(userId: string): Promise<{ pairingToken: string }> {
    const pairingToken = crypto.randomBytes(16).toString('hex');
    // Store in cache for 5 minutes
    await this._cacheService.set(`pairing:${pairingToken}`, userId, 300);
    return { pairingToken };
  }

  async linkDevice(pairingToken: string, deviceId: string, deviceName: string): Promise<DeviceAuthResponse> {
    const userId = await this._cacheService.get<string>(`pairing:${pairingToken}`);
    
    if (!userId) {
      throw new UnauthorizedError('Pairing token expired or invalid');
    }

    const deviceSecret = crypto.randomBytes(32).toString('hex');
    
    // Check if device already exists, update or create
    let device = await this._deviceRepository.findByDeviceId(deviceId);
    
    if (device) {
      await this._deviceRepository.update(deviceId, {
        deviceName,
        deviceSecret,
        owner: userId as any,
        status: 'active',
        lastSeen: new Date()
      });
    } else {
      await this._deviceRepository.create({
        deviceId,
        deviceName,
        deviceSecret,
        owner: userId as any,
        status: 'active',
        lastSeen: new Date()
      });
    }

    const user = await this._userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Clean up pairing token
    await this._cacheService.del(`pairing:${pairingToken}`);

    // Generate a temporary JWT for the initial session
    const payload = { userId, email: user.email, deviceId };
    const deviceToken = generateAccessToken(payload);

    return { deviceToken, deviceSecret };
  }

  async validateDeviceSecret(deviceId: string, deviceSecret: string): Promise<AuthResponse> {
    const device = await this._deviceRepository.findByDeviceId(deviceId);

    if (!device || device.deviceSecret !== deviceSecret) {
      throw new UnauthorizedError('Device not recognized or secret invalid');
    }

    const user = await this._userRepository.findById(device.owner.toString());
    if (!user) {
      throw new UnauthorizedError('Device owner not found');
    }

    // Update last seen
    await this._deviceRepository.update(deviceId, { lastSeen: new Date() });

    const payload = {
      userId: user._id.toString(),
      email: user.email,
      deviceId: deviceId
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    };
  }
}

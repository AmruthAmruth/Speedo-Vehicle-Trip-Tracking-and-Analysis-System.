import { IUserRepository } from '../interfaces/IUserRepository';
import { IAuthService, RegisterDTO, LoginDTO, AuthResponse, RegisterResponse } from '../interfaces/IAuthService';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../shared/utils/jwt.util';
import { comparePassword, hashPassword } from '../shared/utils/password.util';
import { HTTP_MESSAGES } from '../shared/constants/http.constants';
import { BadRequestError, UnauthorizedError } from '../shared/types/errors';
import { injectable, inject } from 'tsyringe';

@injectable()
export class AuthService implements IAuthService {
  constructor(@inject('IUserRepository') private _userRepository: IUserRepository) { }

  async register(data: RegisterDTO): Promise<RegisterResponse> {
    const existingUser = await this._userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new BadRequestError(HTTP_MESSAGES.AUTH.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this._userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword
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
}

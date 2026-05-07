import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { IAuthService } from '../interfaces/IAuthService';
import { HTTP_STATUS } from '../shared/constants/http.constants';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { injectable, inject } from 'tsyringe';

@injectable()
export class AuthController {
  constructor(@inject('IAuthService') private _authService: IAuthService) { }

  register = asyncHandler(async (req: Request, res: Response) => {
    const user = await this._authService.register(req.body);
    res.status(HTTP_STATUS.CREATED).json(user);
  });

  login = asyncHandler(async (req: Request, res: Response) => {
    const result = await this._authService.login(req.body);
    res.status(HTTP_STATUS.OK).json(result);
  });

  refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;
    const result = await this._authService.refresh(refreshToken);
    res.status(HTTP_STATUS.OK).json(result);
  });

  getPairingToken = asyncHandler(async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: 'User not authenticated' });
      return;
    }
    const result = await this._authService.generatePairingToken(userId);
    res.status(HTTP_STATUS.OK).json(result);
  });

  linkDevice = asyncHandler(async (req: Request, res: Response) => {
    const { pairingToken, deviceId, deviceName } = req.body;
    const result = await this._authService.linkDevice(pairingToken, deviceId, deviceName);
    res.status(HTTP_STATUS.OK).json(result);
  });

  validateDeviceSecret = asyncHandler(async (req: Request, res: Response) => {
    const { deviceId, deviceSecret } = req.body;
    const result = await this._authService.validateDeviceSecret(deviceId, deviceSecret);
    res.status(HTTP_STATUS.OK).json(result);
  });
}

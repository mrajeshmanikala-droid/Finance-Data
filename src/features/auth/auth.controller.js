import authService from './auth.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

class AuthController {
  async register(req, res, next) {
    try {
      const user = await authService.register(req.body);
      ApiResponse.created(res, 'User registered successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      ApiResponse.success(res, 'Login successful', result);
    } catch (error) {
      next(error);
    }
  }

  async refresh(req, res, next) {
    try {
      const result = await authService.refresh(req.body.refreshToken);
      ApiResponse.success(res, 'Token refreshed successfully', result);
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      await authService.logout(req.body.refreshToken);
      ApiResponse.success(res, 'Logged out successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

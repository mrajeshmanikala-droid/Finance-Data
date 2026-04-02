import usersService from './users.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

class UsersController {
  async listUsers(req, res, next) {
    try {
      const { users, totalItems, page, limit } = await usersService.listUsers(req.query);
      ApiResponse.paginated(res, 'Users retrieved successfully', users, {
        page,
        limit,
        totalItems,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req, res, next) {
    try {
      const user = await usersService.getUserById(req.params.id);
      ApiResponse.success(res, 'User retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await usersService.updateUser(req.params.id, req.body);
      ApiResponse.success(res, 'User updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const user = await usersService.deleteUser(req.params.id);
      ApiResponse.success(res, 'User deactivated successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await usersService.getProfile(req.user.id);
      ApiResponse.success(res, 'Profile retrieved successfully', { user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await usersService.updateProfile(req.user.id, req.body);
      ApiResponse.success(res, 'Profile updated successfully', { user });
    } catch (error) {
      next(error);
    }
  }
}

export default new UsersController();

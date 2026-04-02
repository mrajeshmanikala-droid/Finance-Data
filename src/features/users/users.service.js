import bcrypt from 'bcryptjs';
import ApiError from '../../utils/ApiError.js';
import User from '../../models/User.js';

class UsersService {
  async listUsers({ page = 1, limit = 20, role, status, search }) {
    const filter = {};

    if (role) filter.role = role;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const totalItems = await User.countDocuments(filter);
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return { users, totalItems, page, limit };
  }

  async getUserById(id) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return user;
  }

  async updateUser(id, updateData) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (updateData.name !== undefined) user.name = updateData.name;
    if (updateData.role !== undefined) user.role = updateData.role;
    if (updateData.status !== undefined) user.status = updateData.status;

    await user.save();
    return user;
  }

  async deleteUser(id) {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.status = 'INACTIVE';
    await user.save();
    return user;
  }

  async getProfile(userId) {
    return this.getUserById(userId);
  }

  async updateProfile(userId, updateData) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (updateData.name !== undefined) user.name = updateData.name;

    if (updateData.email !== undefined) {
      const existing = await User.findOne({ email: updateData.email, _id: { $ne: userId } });
      if (existing) {
        throw ApiError.conflict('Email already in use');
      }
      user.email = updateData.email;
    }

    if (updateData.newPassword) {
      const isValid = await bcrypt.compare(updateData.currentPassword, user.password);
      if (!isValid) {
        throw ApiError.badRequest('Current password is incorrect');
      }
      user.password = await bcrypt.hash(updateData.newPassword, 12);
    }

    await user.save();

    // Return without password
    return User.findById(userId);
  }
}

export default new UsersService();

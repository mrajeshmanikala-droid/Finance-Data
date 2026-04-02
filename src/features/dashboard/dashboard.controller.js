import dashboardService from './dashboard.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      ApiResponse.success(res, 'Dashboard summary retrieved', summary);
    } catch (error) {
      next(error);
    }
  }

  async getCategoryBreakdown(req, res, next) {
    try {
      const breakdown = await dashboardService.getCategoryBreakdown();
      ApiResponse.success(res, 'Category breakdown retrieved', breakdown);
    } catch (error) {
      next(error);
    }
  }

  async getMonthlyTrends(req, res, next) {
    try {
      const trends = await dashboardService.getMonthlyTrends();
      ApiResponse.success(res, 'Monthly trends retrieved', trends);
    } catch (error) {
      next(error);
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const activity = await dashboardService.getRecentActivity();
      ApiResponse.success(res, 'Recent activity retrieved', activity);
    } catch (error) {
      next(error);
    }
  }
}

export default new DashboardController();

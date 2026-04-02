import recordsService from './records.service.js';
import ApiResponse from '../../utils/ApiResponse.js';

class RecordsController {
  async createRecord(req, res, next) {
    try {
      const record = await recordsService.createRecord(req.body, req.user.id);
      ApiResponse.created(res, 'Financial record created successfully', { record });
    } catch (error) {
      next(error);
    }
  }

  async listRecords(req, res, next) {
    try {
      const { records, totalItems, page, limit } = await recordsService.listRecords(req.query);
      ApiResponse.paginated(res, 'Records retrieved successfully', records, {
        page,
        limit,
        totalItems,
      });
    } catch (error) {
      next(error);
    }
  }

  async getRecord(req, res, next) {
    try {
      const record = await recordsService.getRecordById(req.params.id);
      ApiResponse.success(res, 'Record retrieved successfully', { record });
    } catch (error) {
      next(error);
    }
  }

  async updateRecord(req, res, next) {
    try {
      const record = await recordsService.updateRecord(req.params.id, req.body);
      ApiResponse.success(res, 'Record updated successfully', { record });
    } catch (error) {
      next(error);
    }
  }

  async deleteRecord(req, res, next) {
    try {
      const result = await recordsService.deleteRecord(req.params.id);
      ApiResponse.success(res, 'Record deleted successfully', result);
    } catch (error) {
      next(error);
    }
  }
}

export default new RecordsController();

class ApiResponse {
  constructor(statusCode, message, data = null, meta = null) {
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    if (data !== null) this.data = data;
    if (meta !== null) this.meta = meta;
  }

  static success(res, message, data = null, meta = null, statusCode = 200) {
    const response = new ApiResponse(statusCode, message, data, meta);
    return res.status(statusCode).json(response);
  }

  static created(res, message, data = null) {
    return ApiResponse.success(res, message, data, null, 201);
  }

  static paginated(res, message, data, pagination) {
    const meta = {
      page: pagination.page,
      limit: pagination.limit,
      totalItems: pagination.totalItems,
      totalPages: Math.ceil(pagination.totalItems / pagination.limit),
    };
    return ApiResponse.success(res, message, data, meta);
  }
}

export default ApiResponse;

import ApiError from '../utils/ApiError.js';

/**
 * Creates a validation middleware from a Zod schema.
 */
const validate = (schema) => {
  return (req, res, next) => {
    try {
      const shape = schema.shape;
      const dataToValidate = {};

      if (shape?.body) {
        dataToValidate.body = req.body;
      }
      if (shape?.query) {
        dataToValidate.query = req.query;
      }
      if (shape?.params) {
        dataToValidate.params = req.params;
      }

      if (Object.keys(dataToValidate).length > 0) {
        const result = schema.safeParse(dataToValidate);
        if (!result.success) {
          const errors = result.error?.errors ? result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })) : [{ field: 'unknown', message: 'Validation error', error: String(result.error) }];
          return next(ApiError.badRequest('Validation failed', errors));
        }

        if (result.data.body) req.body = result.data.body;
        if (result.data.query) req.query = result.data.query;
        if (result.data.params) req.params = { ...req.params, ...result.data.params };
      } else {
        // Simple body-only schema (no wrapper)
        const result = schema.safeParse(req.body);
        if (!result.success) {
          const errors = result.error?.errors ? result.error.errors.map((e) => ({
            field: e.path.join('.'),
            message: e.message,
          })) : [{ field: 'unknown', message: 'Validation error', error: String(result.error) }];
          return next(ApiError.badRequest('Validation failed', errors));
        }
        req.body = result.data;
      }

      next();
    } catch (error) {
      if (error instanceof ApiError) {
        return next(error);
      }
      console.error('Validation middleware error:', error);
      next(ApiError.badRequest('Invalid request data'));
    }
  };
};

export default validate;

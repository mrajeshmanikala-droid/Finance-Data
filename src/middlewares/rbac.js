import ApiError from '../utils/ApiError.js';

const ROLE_HIERARCHY = {
  VIEWER: 1,
  ANALYST: 2,
  ADMIN: 3,
};

/**
 * Factory function that creates RBAC middleware.
 * Accepts one or more allowed roles.
 *
 * Usage: authorize('ADMIN') or authorize('ANALYST', 'ADMIN')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}. Your role: ${userRole}`
        )
      );
    }

    next();
  };
};

export { authorize, ROLE_HIERARCHY };
export default authorize;

/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces USER, RESPONDER, HOSPITAL, and ADMIN permissions.
 */

const ROLES = {
  USER: 'USER',
  RESPONDER: 'RESPONDER',
  HOSPITAL: 'HOSPITAL',
  ADMIN: 'ADMIN'
};

function authMiddleware(req, res, next) {
  // Extract role from authorization header or demo session header
  const authHeader = req.headers.authorization || '';
  const roleHeader = req.headers['x-user-role'] || 'USER';
  const userIdHeader = req.headers['x-user-id'] || 'usr_rahul_01';

  req.user = {
    id: userIdHeader,
    role: roleHeader.toUpperCase(),
    token: authHeader
  };

  next();
}

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: requires one of [${allowedRoles.join(', ')}] roles`
      });
    }
    next();
  };
}

module.exports = {
  ROLES,
  authMiddleware,
  requireRole
};

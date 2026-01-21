/**
 * Role-Based Access Control Middleware
 * 
 * Server-side enforcement of role permissions.
 * Teachers and CRPs have distinct access rights.
 * 
 * IMPORTANT: This is MVP authentication using x-user-role header.
 * For production, replace with JWT/session-based authentication.
 * 
 * Role Enforcement Rules:
 * - Teachers: Can view PrepCards, submit reflections/feedback
 * - CRPs: Can view PrepCards, access dashboard, create revisions
 */

const VALID_ROLES = ['teacher', 'crp'];

/**
 * Middleware factory that validates user role from request header.
 * 
 * @param {...string} allowedRoles - Roles allowed to access the route
 * @returns {Function} Express middleware function
 * 
 * @example
 * // Allow only CRPs
 * router.get('/dashboard', roleAuth('crp'), handler);
 * 
 * // Allow both teachers and CRPs
 * router.get('/prep-cards', roleAuth('teacher', 'crp'), handler);
 */
const roleAuth = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.headers['x-user-role'];

        // Validate role header exists and is valid
        if (!userRole || !VALID_ROLES.includes(userRole)) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'Valid x-user-role header (teacher or crp) is required'
            });
        }

        // Check if user's role is in allowed roles
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied',
                message: `This endpoint requires one of: ${allowedRoles.join(', ')}`
            });
        }

        // Attach role to request for downstream use
        req.userRole = userRole;
        next();
    };
};

/**
 * Optional role detection middleware.
 * Attaches role to request if present, but doesn't block.
 * Useful for routes that behave differently based on role.
 */
const detectRole = (req, res, next) => {
    const userRole = req.headers['x-user-role'];
    if (userRole && VALID_ROLES.includes(userRole)) {
        req.userRole = userRole;
    }
    next();
};

module.exports = { roleAuth, detectRole, VALID_ROLES };

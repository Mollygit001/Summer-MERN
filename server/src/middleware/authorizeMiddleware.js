import permissions from "../constants/permissions.js";

const authorize = (requiredPermission) => {

    return (req, res, next) => {
        const user = req.user; // Assuming user is set in req by a previous middleware

        if (!user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const userPermissions = permissions[user.role] || [];
        if (userPermissions.includes(requiredPermission)) {
            return next();
        }
        // If the user does not have the required permission
        console.error(`User ${user.name} having ${user.role} role does not have permission: ${requiredPermission}`);

        return res.status(403).json({ message: 'Forbidden' });
    };
}

export default authorize;
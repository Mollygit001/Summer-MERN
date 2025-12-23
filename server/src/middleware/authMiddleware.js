import jwt from 'jsonwebtoken';
import logger from '../utilities/logger.js';

const authMiddleware = {
    protect: async (request, response, next) => {
        try {
            const token = request.cookies?.jwtToken;
            if (!token) {
                return response.status(401).json({ error: 'Not Authorized' });
            }

            const user = jwt.verify(token, process.env.JWT_SECRET);
            request.user = user;
            next();
        } catch (error) {
            logger.error('Auth middleware error:', error);
            return response.status(500).json({ error: 'Internal server error' });
        }
    },
};

export default authMiddleware;
const ac = require('../config/accessControl');
const User = require('../models/user');

const checkPermission = (action, resource) => {
    return async (req, res, next) => {
        try {
            await User.findById(req.userId)
                .then((user) => {
                    if (user) {
                        const permission = ac.can(user.role)[action](resource);
                        if (!permission.granted) {
                            return res.status(403).json({ error: 'Access denied' });
                        }
                        next();
                    }
                    else {
                        return res.status(401).json({
                            message: 'User does not exists.'
                        })
                    }
                })
        } catch (error) {
            console.error('Permission check error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
};

module.exports = { checkPermission };
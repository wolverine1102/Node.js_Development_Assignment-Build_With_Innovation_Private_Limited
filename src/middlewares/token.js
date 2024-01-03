const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

const generateAccessToken = function (userId) {
    return jwt.sign(userId, TOKEN_SECRET)
};

const authenticateToken = function (req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];  //Authorization: 'Bearer TOKEN'
    
    if (token == null) {
        res.status(401).json({
            success: false,
            message: 'Error. Token not provided'
        });
        return;
    }

    jwt.verify(token, TOKEN_SECRET, (err, userId) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.userId = userId;
        next();
    })
};

module.exports = {
    generateAccessToken,
    authenticateToken
}

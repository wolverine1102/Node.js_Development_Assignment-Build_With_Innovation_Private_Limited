const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const TOKEN_SECRET = process.env.TOKEN_SECRET;

const generateAccessToken = function (userId) {
    return jwt.sign(userId, TOKEN_SECRET)
};

const authenticateToken = function (req, res, next) {

};

module.exports = {
    generateAccessToken,
    authenticateToken
}
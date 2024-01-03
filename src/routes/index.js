const { Router } = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const token = require('../middlewares/token');

const router = Router();
const authenticateToken = token.authenticateToken;

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/user/profile', authenticateToken, profileController.getProfile);
router.put('/user/profile', authenticateToken, profileController.updateProfile);
router.delete('/user/profile', authenticateToken, profileController.deleteProfile);

module.exports.router = router;
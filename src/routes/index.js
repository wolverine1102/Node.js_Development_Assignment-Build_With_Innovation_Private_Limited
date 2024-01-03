const { Router } = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const token = require('../middlewares/token');
const checkPermission  = require('../middlewares/checkPermission').checkPermission;

const router = Router();
const authenticateToken = token.authenticateToken;

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/user/profile', authenticateToken, checkPermission('readOwn', 'profile'), profileController.getProfile);
router.put('/user/profile', authenticateToken, checkPermission('updateOwn', 'profile'), profileController.updateProfile);
router.delete('/user/profile', authenticateToken, checkPermission('deleteOwn', 'profile'), profileController.deleteProfile);

module.exports.router = router;
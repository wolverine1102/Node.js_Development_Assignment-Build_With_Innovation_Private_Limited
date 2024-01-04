const { Router } = require('express');
const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const adminController = require('../controllers/adminController');
const token = require('../middlewares/token');
const checkPermission  = require('../middlewares/checkPermission').checkPermission;
const upload = require('../middlewares/multerConfig');

const router = Router();
const authenticateToken = token.authenticateToken;

router.post('/register', upload.single('profileImage'), authController.register);
router.post('/login', authController.login);

router.get('/user/profile', authenticateToken, checkPermission('readOwn', 'profile'), profileController.getProfile);
router.put('/user/profile', authenticateToken, checkPermission('updateOwn', 'profile'), upload.single('profileImage'), profileController.updateProfile);
router.delete('/user/profile', authenticateToken, checkPermission('deleteOwn', 'profile'), profileController.deleteProfile);

router.get('/admin/profiles', authenticateToken, checkPermission('readAny', 'profile'), adminController.getAllProfiles);
router.get('/admin/profile', authenticateToken, checkPermission('readAny', 'profile'), adminController.getProfile);
router.post('/admin/create', authenticateToken, checkPermission('createAny', 'profile'), adminController.createAdmin);
router.put('/admin/profile', authenticateToken, checkPermission('updateAny', 'profile'), adminController.updateProfile);
router.delete('/admin/profile', authenticateToken, checkPermission('deleteAny', 'profile'), adminController.deleteProfile);

module.exports.router = router;
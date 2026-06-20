const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/multer.middleware');
const {
  getProfile,
  updateProfile,
  updateAvatar,
  deleteAccount
} = require('../controllers/profile.controller');

router.use(verifyJWT);

router.get('/', getProfile);
router.patch('/update', updateProfile);
router.patch('/avatar', upload.single('avatar'), updateAvatar);
router.post('/delete', deleteAccount);

module.exports = router;

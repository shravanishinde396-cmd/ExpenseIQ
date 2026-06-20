const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth.middleware');
const {
  getAdminStats,
  getAllUsers,
  toggleUserActivation
} = require('../controllers/admin.controller');

router.use(verifyJWT);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.patch('/users/:userId/toggle', toggleUserActivation);

module.exports = router;

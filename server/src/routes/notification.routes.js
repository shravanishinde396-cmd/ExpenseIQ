const express = require('express');
const { NotificationModel } = require('../models/Notification.model');
const { verifyJWT } = require('../middleware/auth.middleware');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.use(verifyJWT);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const limit = Number(req.query.limit) || 50;
    const notifications = await NotificationModel.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);
    return res.json(new ApiResponse(200, { notifications }, 'Notifications retrieved'));
  })
);

router.get(
  '/unread-count',
  asyncHandler(async (req, res) => {
    const count = await NotificationModel.countDocuments({
      userId: req.user._id,
      isRead: false
    });
    return res.json(new ApiResponse(200, { count }, 'Unread count retrieved'));
  })
);

router.patch(
  '/:id/read',
  asyncHandler(async (req, res) => {
    const notification = await NotificationModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { isRead: true },
      { new: true }
    );
    return res.json(new ApiResponse(200, notification, 'Notification marked as read'));
  })
);

router.patch(
  '/read-all',
  asyncHandler(async (req, res) => {
    await NotificationModel.updateMany(
      { userId: req.user._id, isRead: false },
      { isRead: true }
    );
    return res.json(new ApiResponse(200, null, 'All notifications marked as read'));
  })
);

module.exports = router;

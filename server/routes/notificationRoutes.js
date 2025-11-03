const express = require('express');
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification,
  getNotificationCount 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', protect, getNotifications);
router.get('/count', protect, getNotificationCount);
router.put('/read-all', protect, markAllAsRead);
router.put('/:notificationId/read', protect, markAsRead);
router.delete('/:notificationId', protect, deleteNotification);

module.exports = router;
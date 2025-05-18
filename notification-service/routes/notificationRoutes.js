const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const publishNotification = require('../services/queueService');

router.post('/notifications', async (req, res) => {
  const { userId, type, message } = req.body;
  console.log(userId);
  if (!userId || !type || !message) {
    return res.status(400).json({ success: false, error: 'Missing required fields: userId, type, message' });
  }

  const validTypes = ['email', 'sms', 'in-app'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({ success: false, error: `Type must be one of: ${validTypes.join(', ')}` });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (error) {
    console.error('Error finding user:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while finding user' });
  }
  try {
    await publishNotification({ userId, type, message });
    return res.status(200).json({ success: true, message: 'Notification enqueued successfully' });
  } catch (error) {
    console.error('Failed to enqueue notification:', error);
    return res.status(500).json({ success: false, error: 'Failed to enqueue notification' });
  }
});

router.get('/users/:id/notifications', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const notifications = await Notification.find({ userId })
      .select('_id type message status createdAt')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notifications.length,
      notifications: notifications.map(n => ({
        id: n._id,
        type: n.type,
        message: n.message,
        status: n.status,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, error: 'Internal server error while fetching notifications' });
  }
});

module.exports = router;

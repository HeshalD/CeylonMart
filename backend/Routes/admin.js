const express = require('express');
const Notification = require('../Models/Notification');
const Message = require('../Models/Message');
const { adminAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/admin/send-notification
router.post('/send-notification', adminAuth, async (req, res) => {
  try {
    const { supplierId, title, message } = req.body;
    if (!supplierId || !title || !message) return res.status(400).json({ message: 'Missing fields' });
    const doc = await Notification.create({ supplierId, title, message });
    // also store as Message from admin for thread continuity
    await Message.create({ supplierId, sender: 'admin', title, content: message });
    return res.status(201).json(doc);
  } catch (err) {
    console.error('send-notification error:', err);
    return res.status(500).json({ message: 'Failed to send notification' });
  }
});

// GET /api/admin/messages/:supplierId
router.get('/messages/:supplierId', adminAuth, async (req, res) => {
  try {
    const { supplierId } = req.params;
    const docs = await Message.find({ supplierId }).sort({ createdAt: 1 });
    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

module.exports = router;

// Admin Inbox: supplier -> admin messages
router.get('/inbox', adminAuth, async (_req, res) => {
  try {
    const docs = await Message.find({ sender: 'supplier' })
      .sort({ createdAt: -1 })
      .populate('supplierId', 'companyName contactName email');
    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch inbox' });
  }
});

router.patch('/messages/:id/mark-read', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Message not found' });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update message' });
  }
});

router.delete('/messages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Message.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Message not found' });
    return res.status(200).json({ message: 'Message deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete message' });
  }
});



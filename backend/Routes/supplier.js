const express = require('express');
const Notification = require('../Models/Notification');
const Message = require('../Models/Message');
const { auth } = require('../middleware/auth');

const router = express.Router();

// GET /api/supplier/notifications/:id
router.get('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (req.user?.supplierId && req.user.supplierId !== id) {
      // optionally enforce ownership
    }
    const docs = await Notification.find({ supplierId: id }).sort({ createdAt: -1 });
    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch notifications' });
  }
});

// PATCH /api/supplier/notifications/:id/mark-read
router.patch('/notifications/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Notification not found' });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update notification' });
  }
});

// DELETE /api/supplier/notifications/:id
router.delete('/notifications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Notification not found' });
    return res.status(200).json({ message: 'Notification deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete notification' });
  }
});

// POST /api/supplier/reply/:id  (id: supplierId)
router.post('/reply/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ message: 'Missing fields' });
    const msg = await Message.create({ supplierId: id, sender: 'supplier', title, content });
    return res.status(201).json(msg);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to send reply' });
  }
});

// GET /api/supplier/messages/:id (supplier thread)
router.get('/messages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await Message.find({ supplierId: id }).sort({ createdAt: 1 });
    return res.status(200).json(docs);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

// PATCH /api/messages/:id/mark-read
router.patch('/messages/:id/mark-read', async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Message.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!doc) return res.status(404).json({ message: 'Message not found' });
    return res.status(200).json(doc);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to update message' });
  }
});

module.exports = router;



const ReorderRequest = require('../Models/ReorderRequest');

exports.list = async (req, res) => {
  try {
    const items = await ReorderRequest.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reorder requests' });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = Array.isArray(req.body) ? req.body : [req.body];
    const created = await ReorderRequest.insertMany(payload);
    res.status(201).json(created);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create reorder request' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body || {};
    const updated = await ReorderRequest.findByIdAndUpdate(id, update, { new: true });
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update reorder request' });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ReorderRequest.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ message: 'Not found' });
    res.json({ success: true, action: 'deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Failed to delete reorder request' });
  }
};



const mongoose = require('mongoose');

const ReorderRequestSchema = new mongoose.Schema(
  {
    type: { type: String, default: 'reorder' },
    product: { type: String, required: true },
    quantity: { type: Number, required: true },
    requiredDate: { type: String, default: '' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    createdAt: { type: Date, default: Date.now },
    approvedAt: { type: Date },
    rejectedAt: { type: Date },
    rejectReason: { type: String, default: '' },
    archivedByRequester: { type: Boolean, default: false }
  },
  { timestamps: false }
);

module.exports = mongoose.model('ReorderRequest', ReorderRequestSchema);



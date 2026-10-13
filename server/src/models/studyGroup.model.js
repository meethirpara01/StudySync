const mongoose = require('mongoose');

const studyGroupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a group name'],
    trim: true,
  },
  subject: {
    type: String,
    required: [true, 'Please add a subject'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please add a description'],
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  ],
  joinRequests: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      requestedAt: {
        type: Date,
        default: Date.now,
      },
      reviewedAt: Date,
    }
  ],
  notes: {
    type: String,
    default: '',
  },
  noteHistory: [
    {
      content: String,
      updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('StudyGroup', studyGroupSchema);

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudyGroup',
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Please add message content'],
  },
  type: {
    type: String,
    enum: ['text', 'system', 'ai', 'file', 'link'],
    default: 'text',
  },
  fileName: String,
  fileSize: Number,
  fileData: String, // Store base64 data for demo purposes
  reactions: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      emoji: String
    }
  ],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Message', messageSchema);

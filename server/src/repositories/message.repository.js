const Message = require('../models/message.model');

class MessageRepository {
  async create(messageData) {
    const message = await Message.create(messageData);
    return await Message.findById(message._id)
      .populate('sender', 'name email avatar')
      .populate('reactions.user', 'name');
  }

  async findByGroup(groupId, limit = 50) {
    return await Message.find({ group: groupId })
      .sort({ createdAt: 1 })
      .limit(limit)
      .populate('sender', 'name email avatar')
      .populate('reactions.user', 'name');
  }

  async delete(messageId) {
    return await Message.findByIdAndDelete(messageId);
  }

  async addReaction(messageId, userId, emoji) {
    const message = await Message.findById(messageId);
    if (!message) return null;

    // Remove existing reaction from this user if same emoji
    const existingIndex = message.reactions.findIndex(r => r.user.toString() === userId.toString() && r.emoji === emoji);
    
    if (existingIndex > -1) {
      message.reactions.splice(existingIndex, 1);
    } else {
      // Add new reaction
      message.reactions.push({ user: userId, emoji });
    }

    await message.save();
    return await Message.findById(messageId).populate('sender', 'name email avatar').populate('reactions.user', 'name');
  }
}

module.exports = new MessageRepository();

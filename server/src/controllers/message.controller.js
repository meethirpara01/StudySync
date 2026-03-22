const messageService = require('../services/message.service');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get group messages
// @route   GET /api/messages/:groupId
// @access  Private
const getGroupMessages = asyncHandler(async (req, res) => {
  const { limit } = req.query;
  const messages = await messageService.getGroupMessages(req.params.groupId, parseInt(limit));
  res.json(messages);
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { group, content, type } = req.body;
  const message = await messageService.sendMessage({
    group,
    sender: req.user._id,
    content,
    type,
  });
  res.status(201).json(message);
});

module.exports = {
  getGroupMessages,
  sendMessage,
};

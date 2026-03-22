const messageRepository = require('../repositories/message.repository');
const logger = require('../utils/logger');

class MessageService {
  async sendMessage(messageData) {
    const { group, sender, content, type, fileName, fileSize, fileData } = messageData;
    const message = await messageRepository.create({
      group,
      sender,
      content,
      type: type || 'text',
      fileName,
      fileSize,
      fileData,
    });
    logger.info(`Message sent in group ${group} by ${sender}`);
    return message;
  }

  async getGroupMessages(groupId, limit) {
    return await messageRepository.findByGroup(groupId, limit);
  }
}

module.exports = new MessageService();

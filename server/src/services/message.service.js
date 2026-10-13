const messageRepository = require('../repositories/message.repository');
const studyGroupService = require('./studyGroup.service');
const logger = require('../utils/logger');

class MessageService {
  async sendMessage(messageData, userId) {
    const { group, sender, content, type, fileName, fileSize, fileData } = messageData;
    await studyGroupService.requireMember(group, userId);
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

  async getGroupMessages(groupId, limit, userId) {
    await studyGroupService.requireMember(groupId, userId);
    return await messageRepository.findByGroup(groupId, limit);
  }
}

module.exports = new MessageService();

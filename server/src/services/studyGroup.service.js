const studyGroupRepository = require('../repositories/studyGroup.repository');
const logger = require('../utils/logger');

class StudyGroupService {
  async createGroup(groupData, creatorId) {
    const { name, subject, description } = groupData;
    const group = await studyGroupRepository.create({
      name,
      subject,
      description,
      createdBy: creatorId,
      members: [creatorId],
    });
    logger.info(`Study Group created: ${group.name} by ${creatorId}`);
    return group;
  }

  async getAllGroups() {
    return await studyGroupRepository.findAll();
  }

  async getUserGroups(userId) {
    return await studyGroupRepository.findByMember(userId);
  }

  async getGroupById(groupId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }
    return group;
  }

  async joinGroup(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }
    
    const updatedGroup = await studyGroupRepository.addMember(groupId, userId);
    logger.info(`User ${userId} joined study group: ${groupId}`);
    return updatedGroup;
  }

  async leaveGroup(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }
    
    const updatedGroup = await studyGroupRepository.removeMember(groupId, userId);
    logger.info(`User ${userId} left study group: ${groupId}`);
    return updatedGroup;
  }
}

module.exports = new StudyGroupService();

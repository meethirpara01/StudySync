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

  async requestToJoinGroup(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    const isMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (isMember) {
      throw new Error('You are already a member of this group');
    }

    const hasPendingRequest = group.joinRequests.some((request) => request._id.toString() === userId.toString());
    if (hasPendingRequest) {
      throw new Error('Your join request is already pending approval');
    }

    const updatedGroup = await studyGroupRepository.addJoinRequest(groupId, userId);
    logger.info(`Join request submitted by ${userId} for group: ${groupId}`);
    return updatedGroup;
  }

  async approveJoinRequest(groupId, userId, adminId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    if (group.createdBy._id.toString() !== adminId.toString()) {
      throw new Error('Only the group admin can approve requests');
    }

    const isAlreadyMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (isAlreadyMember) {
      throw new Error('This user is already a member');
    }

    const updatedGroup = await studyGroupRepository.approveJoinRequest(groupId, userId);
    logger.info(`User ${userId} approved into study group: ${groupId} by admin ${adminId}`);
    return updatedGroup;
  }

  async acceptInvite(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    const isMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (isMember) {
      return group;
    }

    const updatedGroup = await studyGroupRepository.addMember(groupId, userId);
    logger.info(`User ${userId} accepted invite to study group: ${groupId}`);
    return updatedGroup;
  }

  async joinGroup(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    const isMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (isMember) {
      return group;
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

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

  async getAllGroups(userId) {
    const groups = await studyGroupRepository.findAll();

    return groups.map((group) => {
      const creatorId = group.createdBy?._id?.toString() || group.createdBy?.toString();
      if (creatorId !== userId.toString()) {
        group.joinRequests = (group.joinRequests || []).filter((request) => {
          const requesterId = request.user?._id?.toString() || request.user?.toString();
          return requesterId === userId.toString();
        });
      }
      return group;
    });
  }

  async getUserGroups(userId) {
    return await studyGroupRepository.findByMember(userId);
  }

  async getGroupById(groupId, userId) {
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    const creatorId = group.createdBy?._id?.toString() || group.createdBy?.toString();
    if (userId && creatorId !== userId.toString()) {
      group.joinRequests = (group.joinRequests || []).filter((request) => {
        const requesterId = request.user?._id?.toString() || request.user?.toString();
        return requesterId === userId.toString();
      });
    }

    return group;
  }

  async requireMember(groupId, userId) {
    const group = await this.getGroupById(groupId);
    const isMember = group.members.some((member) => member._id.toString() === userId.toString());

    if (!isMember) {
      const error = new Error('You do not have access to this study group');
      error.statusCode = 403;
      throw error;
    }

    return group;
  }

  async acceptInvite(groupId, userId) {
    const group = await this.getGroupById(groupId);
    const isMember = group.members.some((member) => member._id.toString() === userId.toString());

    if (isMember) {
      return group;
    }

    return await studyGroupRepository.addMember(groupId, userId);
  }

  async requestToJoinGroup(groupId, userId) {
    const group = await this.getGroupById(groupId);
    const isMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (isMember) {
      throw new Error('You are already a member of this group');
    }

    const request = group.joinRequests.find((item) => item.user._id.toString() === userId.toString());
    if (request?.status === 'pending') {
      return group;
    }

    const updatedGroup = await studyGroupRepository.upsertJoinRequest(groupId, userId);
    logger.info(`Join request submitted by ${userId} for group: ${groupId}`);
    return updatedGroup;
  }

  async reviewJoinRequest(groupId, userId, adminId, status) {
    const group = await this.getGroupById(groupId);
    if (group.createdBy._id.toString() !== adminId.toString()) {
      const error = new Error('Only the group admin can review join requests');
      error.statusCode = 403;
      throw error;
    }

    const request = group.joinRequests.find((item) => item.user._id.toString() === userId.toString());
    if (!request || request.status !== 'pending') {
      throw new Error('Pending join request not found');
    }

    const updatedGroup = await studyGroupRepository.updateJoinRequest(groupId, userId, status);
    if (status === 'approved') {
      return await studyGroupRepository.addMember(groupId, userId);
    }

    return updatedGroup;
  }

  async joinGroup(groupId, userId) {
    return await this.requestToJoinGroup(groupId, userId);
  }

  async leaveGroup(groupId, userId) {
    await this.requireMember(groupId, userId);
    
    const updatedGroup = await studyGroupRepository.removeMember(groupId, userId);
    logger.info(`User ${userId} left study group: ${groupId}`);
    return updatedGroup;
  }
}

module.exports = new StudyGroupService();

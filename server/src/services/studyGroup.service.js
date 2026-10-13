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

  async rejectJoinRequest(groupId, userId, adminId) {
    const group = await this.getGroupById(groupId);
    if (group.createdBy._id.toString() !== adminId.toString()) {
      const error = new Error('Only the group admin can reject requests');
      error.statusCode = 403;
      throw error;
    }

    const hasRequest = group.joinRequests.some((request) => request._id.toString() === userId.toString());
    if (!hasRequest) {
      throw new Error('Join request not found');
    }

    return await studyGroupRepository.rejectJoinRequest(groupId, userId);
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

  async leaveGroup(groupId, userId, options = {}) {
    const { action = 'leave', newAdminId } = options;
    const group = await studyGroupRepository.findById(groupId);
    if (!group) {
      throw new Error('Study group not found');
    }

    const isMember = group.members.some((member) => member._id.toString() === userId.toString());
    if (!isMember) {
      const error = new Error('You are not a member of this group');
      error.statusCode = 400;
      throw error;
    }

    const isAdmin = group.createdBy._id.toString() === userId.toString();
    if (action === 'delete') {
      if (!isAdmin) {
        const error = new Error('Only the group admin can delete the group');
        error.statusCode = 403;
        throw error;
      }
      await studyGroupRepository.delete(groupId);
      logger.info(`Study group deleted by admin ${userId}: ${groupId}`);
      return null;
    }

    if (isAdmin) {
      if (action !== 'transfer' || !newAdminId || newAdminId.toString() === userId.toString()) {
        const error = new Error('Choose another group member as the new admin before leaving');
        error.statusCode = 400;
        throw error;
      }

      const newAdminIsMember = group.members.some((member) => member._id.toString() === newAdminId.toString());
      if (!newAdminIsMember) {
        const error = new Error('The new admin must already be a member of this group');
        error.statusCode = 400;
        throw error;
      }

      const transferredGroup = await studyGroupRepository.transferAdminAndRemoveMember(groupId, userId, newAdminId);
      if (!transferredGroup) {
        throw new Error('Unable to transfer admin role');
      }
      logger.info(`Admin ${userId} transferred group ${groupId} to ${newAdminId} and left`);
      return transferredGroup;
    }

    const updatedGroup = await studyGroupRepository.removeMember(groupId, userId);
    logger.info(`User ${userId} left study group: ${groupId}`);
    return updatedGroup;
  }
}

module.exports = new StudyGroupService();

const StudyGroup = require('../models/studyGroup.model');

class StudyGroupRepository {
  async create(groupData) {
    return await StudyGroup.create(groupData);
  }

  async findById(id) {
    return await StudyGroup.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('joinRequests.user', 'name email')
      .populate('noteHistory.updatedBy', 'name');
  }

  async findAll() {
    return await StudyGroup.find()
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('joinRequests.user', 'name email');
  }

  async findByMember(userId) {
    return await StudyGroup.find({ members: userId }).populate('createdBy', 'name email');
  }

  async addMember(groupId, userId) {
    return await StudyGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('createdBy members joinRequests.user', 'name email');
  }

  async upsertJoinRequest(groupId, userId) {
    return await StudyGroup.findOneAndUpdate(
      { _id: groupId, 'joinRequests.user': userId },
      {
        $set: {
          'joinRequests.$.status': 'pending',
          'joinRequests.$.requestedAt': new Date(),
          'joinRequests.$.reviewedAt': null,
        }
      },
      { new: true }
    ).then(async (group) => {
      if (group) return group.populate('createdBy members joinRequests.user', 'name email');
      return StudyGroup.findByIdAndUpdate(
        groupId,
        { $push: { joinRequests: { user: userId, status: 'pending' } } },
        { new: true }
      ).populate('createdBy members joinRequests.user', 'name email');
    });
  }

  async updateJoinRequest(groupId, userId, status) {
    return await StudyGroup.findOneAndUpdate(
      { _id: groupId, 'joinRequests.user': userId },
      {
        $set: {
          'joinRequests.$.status': status,
          'joinRequests.$.reviewedAt': new Date(),
        }
      },
      { new: true }
    ).populate('createdBy members joinRequests.user', 'name email');
  }

  async removeMember(groupId, userId) {
    return await StudyGroup.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    ).populate('createdBy members joinRequests.user', 'name email');
  }

  async updateNotes(groupId, notes, userId) {
    const update = { notes };
    if (userId) {
      update.$push = {
        noteHistory: {
          $each: [{ content: notes, updatedBy: userId, updatedAt: new Date() }],
          $slice: -10 // Keep only the last 10 versions
        }
      };
    }
    return await StudyGroup.findByIdAndUpdate(
      groupId,
      update,
      { new: true }
    ).populate('noteHistory.updatedBy', 'name');
  }

  async delete(groupId) {
    return await StudyGroup.findByIdAndDelete(groupId);
  }
}

module.exports = new StudyGroupRepository();

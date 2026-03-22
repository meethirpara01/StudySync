const StudyGroup = require('../models/studyGroup.model');

class StudyGroupRepository {
  async create(groupData) {
    return await StudyGroup.create(groupData);
  }

  async findById(id) {
    return await StudyGroup.findById(id)
      .populate('createdBy', 'name email')
      .populate('members', 'name email')
      .populate('noteHistory.updatedBy', 'name');
  }

  async findAll() {
    return await StudyGroup.find().populate('createdBy', 'name email');
  }

  async findByMember(userId) {
    return await StudyGroup.find({ members: userId }).populate('createdBy', 'name email');
  }

  async addMember(groupId, userId) {
    return await StudyGroup.findByIdAndUpdate(
      groupId,
      { $addToSet: { members: userId } },
      { new: true }
    ).populate('members', 'name email');
  }

  async removeMember(groupId, userId) {
    return await StudyGroup.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true }
    ).populate('members', 'name email');
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

const studyGroupService = require('../services/studyGroup.service');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Create a new study group
// @route   POST /api/groups
// @access  Private
const createGroup = asyncHandler(async (req, res) => {
  const group = await studyGroupService.createGroup(req.body, req.user._id);
  res.status(201).json(group);
});

// @desc    Get all study groups
// @route   GET /api/groups
// @access  Public
const getAllGroups = asyncHandler(async (req, res) => {
  const groups = await studyGroupService.getAllGroups();
  res.json(groups);
});

// @desc    Get user study groups
// @route   GET /api/groups/my-groups
// @access  Private
const getUserGroups = asyncHandler(async (req, res) => {
  const groups = await studyGroupService.getUserGroups(req.user._id);
  res.json(groups);
});

// @desc    Get study group by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = asyncHandler(async (req, res) => {
  const group = await studyGroupService.getGroupById(req.params.id);
  res.json(group);
});

// @desc    Join study group
// @route   POST /api/groups/:id/join
// @access  Private
const joinGroup = asyncHandler(async (req, res) => {
  const group = await studyGroupService.joinGroup(req.params.id, req.user._id);
  res.json(group);
});

// @desc    Leave study group
// @route   POST /api/groups/:id/leave
// @access  Private
const leaveGroup = asyncHandler(async (req, res) => {
  const group = await studyGroupService.leaveGroup(req.params.id, req.user._id);
  res.json(group);
});

module.exports = {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  joinGroup,
  leaveGroup,
};

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

// @desc    Request to join study group
// @route   POST /api/groups/:id/request-join
// @access  Private
const requestToJoinGroup = asyncHandler(async (req, res) => {
  const group = await studyGroupService.requestToJoinGroup(req.params.id, req.user._id);
  res.json(group);
});

// @desc    Approve a pending join request
// @route   POST /api/groups/:id/approve-request
// @access  Private
const approveJoinRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const group = await studyGroupService.approveJoinRequest(req.params.id, userId, req.user._id);
  res.json(group);
});

// @desc    Reject a pending join request
// @route   POST /api/groups/:id/reject-request
// @access  Private
const rejectJoinRequest = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const group = await studyGroupService.rejectJoinRequest(req.params.id, userId, req.user._id);
  res.json(group);
});

// @desc    Accept a direct group invite
// @route   POST /api/groups/:id/accept-invite
// @access  Private
const acceptInvite = asyncHandler(async (req, res) => {
  const group = await studyGroupService.acceptInvite(req.params.id, req.user._id);
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
  const group = await studyGroupService.leaveGroup(req.params.id, req.user._id, req.body);
  res.json(group);
});

module.exports = {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  requestToJoinGroup,
  approveJoinRequest,
  rejectJoinRequest,
  acceptInvite,
  joinGroup,
  leaveGroup,
};

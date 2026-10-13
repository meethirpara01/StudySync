import axios from 'axios';

const API_URL = '/api/groups';

// Create new group
const createGroup = async (groupData) => {
  const response = await axios.post(API_URL, groupData);
  return response.data;
};

// Get all groups
const getAllGroups = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get user groups
const getUserGroups = async () => {
  const response = await axios.get(`${API_URL}/my-groups`);
  return response.data;
};

// Get group by ID
const getGroupById = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}`);
  return response.data;
};

// Request to join a group
const requestToJoinGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/request-join`);
  return response.data;
};

// Approve a pending request to join a group
const approveJoinRequest = async (groupId, userId) => {
  const response = await axios.post(`${API_URL}/${groupId}/approve-request`, { userId });
  return response.data;
};

// Accept a direct invite to a group
const acceptInvite = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/accept-invite`);
  return response.data;
};

// Join group
const joinGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/join`);
  return response.data;
};

const groupService = {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  requestToJoinGroup,
  approveJoinRequest,
  acceptInvite,
  joinGroup,
};

export default groupService;

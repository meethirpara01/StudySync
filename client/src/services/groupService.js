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

const acceptInvite = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/accept-invite`);
  return response.data;
};

const requestToJoinGroup = async (groupId) => {
  const response = await axios.post(`${API_URL}/${groupId}/join-request`);
  return response.data;
};

const reviewJoinRequest = async ({ groupId, userId, status }) => {
  const response = await axios.post(`${API_URL}/${groupId}/join-requests/${userId}/${status}`);
  return response.data;
};

const groupService = {
  createGroup,
  getAllGroups,
  getUserGroups,
  getGroupById,
  acceptInvite,
  requestToJoinGroup,
  reviewJoinRequest,
};

export default groupService;

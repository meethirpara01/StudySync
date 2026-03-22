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
  joinGroup,
};

export default groupService;

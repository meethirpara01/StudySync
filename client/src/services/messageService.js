import axios from 'axios';

const API_URL = '/api/messages';

// Get group messages
const getGroupMessages = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}`);
  return response.data;
};

// Send message
const sendMessage = async (messageData) => {
  const response = await axios.post(API_URL, messageData);
  return response.data;
};

const messageService = {
  getGroupMessages,
  sendMessage,
};

export default messageService;

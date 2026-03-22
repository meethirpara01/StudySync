import { combineReducers } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import groupReducer from '../features/groups/groupSlice';
import chatReducer from '../features/chat/chatSlice';
import aiReducer from '../features/ai/aiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  groups: groupReducer,
  chat: chatReducer,
  ai: aiReducer,
});

export default rootReducer;

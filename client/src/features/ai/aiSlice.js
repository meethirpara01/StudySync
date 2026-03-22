import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import aiService from '../../services/aiService';

// Load AI responses from localStorage
const loadAIResponses = () => {
  try {
    const saved = localStorage.getItem('aiResponses');
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading AI responses:', error);
    return [];
  }
};

const initialState = {
  aiResponses: loadAIResponses(),
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Helper to save responses to localStorage
const saveAIResponses = (responses) => {
  try {
    localStorage.setItem('aiResponses', JSON.stringify(responses));
  } catch (error) {
    console.error('Error saving AI responses:', error);
  }
};

// Ask AI
export const askAI = createAsyncThunk(
  'ai/ask',
  async (promptData, thunkAPI) => {
    try {
      return await aiService.askAI(promptData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Summarize notes
export const summarizeNotes = createAsyncThunk(
  'ai/summarize',
  async (notesData, thunkAPI) => {
    try {
      return await aiService.summarizeNotes(notesData);
    } catch (error) {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    clearResponses: (state) => {
      state.aiResponses = [];
      // Clear from localStorage
      localStorage.removeItem('aiResponses');
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(askAI.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(askAI.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Store both user prompt and AI response
        state.aiResponses.push({
          type: 'user',
          content: action.meta.arg.prompt,
          timestamp: new Date().toISOString(),
        });
        state.aiResponses.push({
          type: 'ai',
          content: action.payload.response,
          timestamp: new Date().toISOString(),
        });
        // Save to localStorage
        saveAIResponses(state.aiResponses);
      })
      .addCase(askAI.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(summarizeNotes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(summarizeNotes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.aiResponses.push({
          type: 'summary',
          content: action.payload.summary,
          timestamp: new Date().toISOString(),
        });
        // Save to localStorage
        saveAIResponses(state.aiResponses);
      })
      .addCase(summarizeNotes.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, clearResponses } = aiSlice.actions;
export default aiSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../../services/groupService';

const initialState = {
  groups: [],
  currentGroup: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Create new group
export const createGroup = createAsyncThunk(
  'groups/create',
  async (groupData, thunkAPI) => {
    try {
      return await groupService.createGroup(groupData);
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

// Get all groups
export const getAllGroups = createAsyncThunk(
  'groups/getAll',
  async (_, thunkAPI) => {
    try {
      return await groupService.getAllGroups();
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

// Get user groups
export const getUserGroups = createAsyncThunk(
  'groups/getUserGroups',
  async (_, thunkAPI) => {
    try {
      return await groupService.getUserGroups();
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

// Get group by ID
export const getGroupById = createAsyncThunk(
  'groups/getById',
  async (groupId, thunkAPI) => {
    try {
      return await groupService.getGroupById(groupId);
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

// Request to join group
export const requestToJoinGroup = createAsyncThunk(
  'groups/requestJoin',
  async (groupId, thunkAPI) => {
    try {
      return await groupService.requestToJoinGroup(groupId);
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

// Approve join request
export const approveJoinRequest = createAsyncThunk(
  'groups/approveJoinRequest',
  async ({ groupId, userId }, thunkAPI) => {
    try {
      return await groupService.approveJoinRequest(groupId, userId);
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

// Accept direct invite
export const acceptInvite = createAsyncThunk(
  'groups/acceptInvite',
  async (groupId, thunkAPI) => {
    try {
      return await groupService.acceptInvite(groupId);
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

// Join group
export const joinGroup = createAsyncThunk(
  'groups/join',
  async (groupId, thunkAPI) => {
    try {
      return await groupService.joinGroup(groupId);
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

export const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createGroup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups.push(action.payload);
      })
      .addCase(createGroup.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getAllGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getAllGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = action.payload;
      })
      .addCase(getAllGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getUserGroups.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getUserGroups.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.groups = action.payload;
      })
      .addCase(getUserGroups.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getGroupById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getGroupById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentGroup = action.payload;
      })
      .addCase(getGroupById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(requestToJoinGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      .addCase(approveJoinRequest.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      .addCase(acceptInvite.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      })
      .addCase(joinGroup.fulfilled, (state, action) => {
        state.currentGroup = action.payload;
      });
  },
});

export const { reset, setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;

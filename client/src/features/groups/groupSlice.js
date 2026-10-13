import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import groupService from '../../services/groupService';

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || error.toString();

const initialState = {
  groups: [],
  currentGroup: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const createGroup = createAsyncThunk('groups/create', async (groupData, thunkAPI) => {
  try { return await groupService.createGroup(groupData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const getAllGroups = createAsyncThunk('groups/getAll', async (_, thunkAPI) => {
  try { return await groupService.getAllGroups(); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const getUserGroups = createAsyncThunk('groups/getUserGroups', async (_, thunkAPI) => {
  try { return await groupService.getUserGroups(); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const getGroupById = createAsyncThunk('groups/getById', async (groupId, thunkAPI) => {
  try { return await groupService.getGroupById(groupId); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const acceptInvite = createAsyncThunk('groups/acceptInvite', async (groupId, thunkAPI) => {
  try { return await groupService.acceptInvite(groupId); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const requestToJoinGroup = createAsyncThunk('groups/requestToJoin', async (groupId, thunkAPI) => {
  try { return await groupService.requestToJoinGroup(groupId); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const reviewJoinRequest = createAsyncThunk('groups/reviewJoinRequest', async ({ groupId, userId, status }, thunkAPI) => {
  try { return await groupService.reviewJoinRequest({ groupId, userId, status }); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      state.currentGroup = null;
    },
    setCurrentGroup: (state, action) => {
      state.currentGroup = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGroup.pending, (state) => { state.isLoading = true; })
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
      .addCase(getAllGroups.pending, (state) => { state.isLoading = true; })
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
      .addCase(getUserGroups.pending, (state) => { state.isLoading = true; })
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
      .addCase(getGroupById.pending, (state) => { state.isLoading = true; })
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
      .addCase(acceptInvite.fulfilled, (state, action) => { state.currentGroup = action.payload; })
      .addCase(requestToJoinGroup.fulfilled, (state, action) => {
        const index = state.groups.findIndex((group) => group._id === action.payload._id);
        if (index !== -1) state.groups[index] = action.payload;
      })
      .addCase(reviewJoinRequest.fulfilled, (state, action) => { state.currentGroup = action.payload; });
  },
});

export const { reset, setCurrentGroup } = groupSlice.actions;
export default groupSlice.reducer;

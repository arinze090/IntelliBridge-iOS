import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  user: null,
  registerUser: null,
  userRole: null,
  userPreferences: null,
  token: null,
  launchScreen: null,
  accessToken: null,
  refreshToken: null,
  error: null,
  destination: null,
  lastAPIFetchTime: null,
  lastLoginTime: null,
  userOrders: [],
};

const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    getUser: (state, action) => {
      state.user = action.payload;
    },
    saveRegisterUser: (state, action) => {
      state.registerUser = action.payload;
    },
    saveUserRole: (state, action) => {
      state.userRole = action.payload;
    },
    saveUserPreferences: (state, action) => {
      state.userPreferences = action.payload;
    },
    saveAccessToken: (state, action) => {
      state.accessToken = action.payload;
    },
    saveRefreshToken: (state, action) => {
      state.refreshToken = action.payload;
    },
    saveLaunchScreen: (state, action) => {
      state.launchScreen = action.payload;
    },
    saveLoginTime: (state, action) => {
      state.lastLoginTime = action.payload;
    },
    setLoading: (state, action) => {
      state.loading =
        action.payload?.loading !== undefined
          ? action.payload?.loading
          : state.loading;
    },
    signOut: (state, action) => {
      state.user = null;
      state.userToken = null;
      state.userRole = null;
      state.userPreferences = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.lastLoginTime = null;
    },
    setUserDestination: (state, action) => {
      state.destination = action.payload;
    },

    APILastFetchTime: (state, action) => {
      state.lastAPIFetchTime = action.payload;
    },
    saveUserOrders: (state, action) => {
      state.userOrders = action.payload;
    },
  },
});

export const {
  getUser,
  saveRegisterUser,
  saveUserRole,
  saveUserPreferences,
  saveAccessToken,
  saveRefreshToken,
  setLoading,
  saveLaunchScreen,
  signOut,
  registerUser,
  setUserDestination,
  APILastFetchTime,
  saveLoginTime,
  saveUserOrders,
} = userSlice.actions;
export default userSlice.reducer;

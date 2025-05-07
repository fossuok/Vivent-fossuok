// src/redux/slices/authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { API_URL_CONFIG } from "@/api/configs";

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;

// Thunk for login
export const login = (credentials) => async (dispatch) => {
  try {
    dispatch(loginStart());
    
    // Replace with your Python backend API endpoint
    const response = await fetch(API_URL_CONFIG.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        username: credentials.username,
        password: credentials.password,
      }).toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    dispatch(
      loginSuccess({
        user: {
          id: data.id,
          username: data.username,
          email: data.email,
          role: data.role,
        },
        token: data.access_token,
      })
    );

    return data;
  } catch (error) {
    dispatch(loginFailure(error.message));
    throw error;
  }
};

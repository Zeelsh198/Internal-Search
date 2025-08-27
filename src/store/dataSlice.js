import { createSlice } from "@reduxjs/toolkit";
import { api } from "./apiSlice";

// Load from localStorage
const savedResults = JSON.parse(localStorage.getItem("results")) || [];

export const dataSlice = createSlice({
  name: "data",
  initialState: {
    results: savedResults, // ✅ initialize from localStorage
    status: savedResults.length > 0 ? "succeeded" : "idle",
    error: null,
  },
  reducers: {
    clearResults: (state) => {
      state.results = [];
      state.status = "idle";
      state.error = null;
      localStorage.removeItem("results"); // ✅ clear storage
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(api.endpoints.searchData.matchPending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addMatcher(api.endpoints.searchData.matchFulfilled, (state, action) => {
        state.status = "succeeded";
        state.results = action.payload;

        // ✅ save results to localStorage
        localStorage.setItem("results", JSON.stringify(action.payload));
      })
      .addMatcher(api.endpoints.searchData.matchRejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export const { clearResults } = dataSlice.actions;

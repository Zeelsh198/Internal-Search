import { configureStore } from "@reduxjs/toolkit";
import { dataSlice } from "./dataSlice"; // Import dataSlice
import { api } from "./apiSlice"; // Import api

// Configure the Redux store
const store = configureStore({
  reducer: {
    data: dataSlice.reducer,
    [api.reducerPath]: api.reducer,
  },
  // Adding the api middleware enables caching, invalidation, polling,
  // and other useful features of `rtk-query`.
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

export default store;
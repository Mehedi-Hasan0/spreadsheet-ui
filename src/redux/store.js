// store/index.js
import { configureStore } from "@reduxjs/toolkit";
import sheetReducer from "./slice/sheetSlice";

export const store = configureStore({
  reducer: {
    sheet: sheetReducer,
  },
  // Middleware can be added here later (e.g., for handling the async calculation)
});

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth";
import cartReducer from "./slices/cart";
import compareReducer from "./slices/compare";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    compare: compareReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

import { createSlice } from "@reduxjs/toolkit";

interface UIState {
  isCartOpen: boolean;
  toastMessage: string | null;
  toastType: "success" | "error" | null;
}

const initialState: UIState = {
  isCartOpen: false,
  toastMessage: null,
  toastType: null,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    openCart: (state) => {
      state.isCartOpen = true;
    },
    closeCart: (state) => {
      state.isCartOpen = false;
    },
    toggleCart: (state) => {
      state.isCartOpen = !state.isCartOpen;
    },
    showToast: (state, action) => {
      state.toastMessage = action.payload.message;
      state.toastType = action.payload.type || "success";
    },
    clearToast: (state) => {
      state.toastMessage = null;
      state.toastType = null;
    },
  },
});

export const { openCart, closeCart, toggleCart, showToast, clearToast } = uiSlice.actions;
export default uiSlice.reducer;

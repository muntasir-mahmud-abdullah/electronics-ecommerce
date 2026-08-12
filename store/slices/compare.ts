import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
  productIds: string[];
}

// Load from session storage if available
const loadState = (): CompareState => {
  if (typeof window !== "undefined") {
    const saved = sessionStorage.getItem("compareState");
    if (saved) return JSON.parse(saved);
  }
  return { productIds: [] };
};

const initialState: CompareState = loadState();

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<string>) => {
      if (!state.productIds.includes(action.payload) && state.productIds.length < 3) {
        state.productIds.push(action.payload);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("compareState", JSON.stringify(state));
        }
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("compareState", JSON.stringify(state));
      }
    },
    clearCompare: (state) => {
      state.productIds = [];
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("compareState");
      }
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;

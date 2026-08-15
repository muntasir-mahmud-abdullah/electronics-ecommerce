import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
  productIds: string[];
}

// Use empty initial state to avoid hydration mismatch
// Session storage will be loaded client-side
const initialState: CompareState = { productIds: [] };

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<string>) => {
      if (
        !state.productIds.includes(action.payload) &&
        state.productIds.length < 3
      ) {
        state.productIds.push(action.payload);
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
    },
    clearCompare: (state) => {
      state.productIds = [];
    },
  },
});

export const { addToCompare, removeFromCompare, clearCompare } =
  compareSlice.actions;
export default compareSlice.reducer;

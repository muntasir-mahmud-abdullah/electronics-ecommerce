import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CompareState {
  productIds: string[];
}

// Load from session storage if available (client-side only)
const loadFromSessionStorage = (): CompareState => {
  if (typeof window !== "undefined") {
    try {
      const saved = sessionStorage.getItem("compare");
      if (saved) {
        return { productIds: JSON.parse(saved) };
      }
    } catch (error) {
      console.error("Failed to load compare from session storage:", error);
    }
  }
  return { productIds: [] };
};

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
        // Save to session storage
        if (typeof window !== "undefined") {
          try {
            sessionStorage.setItem("compare", JSON.stringify(state.productIds));
          } catch (error) {
            console.error("Failed to save compare to session storage:", error);
          }
        }
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.productIds = state.productIds.filter((id) => id !== action.payload);
      // Save to session storage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("compare", JSON.stringify(state.productIds));
        } catch (error) {
          console.error("Failed to save compare to session storage:", error);
        }
      }
    },
    clearCompare: (state) => {
      state.productIds = [];
      // Clear from session storage
      if (typeof window !== "undefined") {
        try {
          sessionStorage.removeItem("compare");
        } catch (error) {
          console.error("Failed to clear compare from session storage:", error);
        }
      }
    },
    // Initialize from session storage (call this on app mount)
    initializeFromStorage: (state) => {
      const saved = loadFromSessionStorage();
      state.productIds = saved.productIds;
    },
  },
});

export const {
  addToCompare,
  removeFromCompare,
  clearCompare,
  initializeFromStorage,
} = compareSlice.actions;
export default compareSlice.reducer;

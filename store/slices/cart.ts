import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartState {
  items: any[];
  subtotal: number;
  shippingCost: number;
  total: number;
  itemCount: number;
  isLoaded: boolean;
}

const initialState: CartState = {
  items: [],
  subtotal: 0,
  shippingCost: 0,
  total: 0,
  itemCount: 0,
  isLoaded: false,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<any>) => {
      state.items = action.payload.cart?.items || [];
      state.subtotal = action.payload.subtotal || 0;
      state.shippingCost = action.payload.shippingCost || 0;
      state.total = action.payload.total || 0;
      state.itemCount = state.items.reduce((count, item) => count + item.quantity, 0);
      state.isLoaded = true;
    },
    clearCart: (state) => {
      state.items = [];
      state.subtotal = 0;
      state.shippingCost = 0;
      state.total = 0;
      state.itemCount = 0;
    },
  },
});

export const { setCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;

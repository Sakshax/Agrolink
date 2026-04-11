import { createSlice } from '@reduxjs/toolkit';

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    filters: {
      crop: '',
      radius: 50,
      priceRange: [0, 5000],
    },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { crop: '', radius: 50, priceRange: [0, 5000] };
    },
  },
});

export const { setFilters, resetFilters } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;

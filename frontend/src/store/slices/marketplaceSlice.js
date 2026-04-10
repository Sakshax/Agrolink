import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

export const fetchListings = createAsyncThunk(
  'marketplace/fetchListings',
  async (filters) => {
    const response = await axios.get('http://localhost:5000/api/listings', { params: filters });
    return response.data;
  }
);

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    items: JSON.parse(localStorage.getItem('cached_listings')) || [],
    filters: {
      crop: '',
      radius: 50,
      priceRange: [0, 5000],
    },
    status: 'idle',
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = { crop: '', radius: 50, priceRange: [0, 5000] };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchListings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchListings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
        // PWA OFFLINE PERSISTENCE
        localStorage.setItem('cached_listings', JSON.stringify(action.payload));
      })
      .addCase(fetchListings.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export const { setFilters, resetFilters } = marketplaceSlice.actions;
export default marketplaceSlice.reducer;

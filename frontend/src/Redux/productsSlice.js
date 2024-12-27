import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetch products by category
export const fetchProductsByCategory = createAsyncThunk(
  'products/fetchByCategory',
  async (category) => {
    try {
      const response = await fetch(`https://dummyjson.com/products/category/${category}?limit=200`);
      const data = await response.json();
      return { category, products: data.products };
    } catch {
      alert("Getting a fetching error!");
    }
  }
);

// Wrap fetchCart in createAsyncThunk
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch('http://localhost:5000/cart', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Adjust token handling as needed
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.cart || []; // Return fetched cart
    } catch (error) {
      return rejectWithValue(error.message); // Handle errors gracefully
    }
  }
);




// Save cart to backend
export const saveCart = createAsyncThunk(
  'cart/saveCart',
  async ({ token, cart }) => {
    try {
      const response = await fetch('http://localhost:5000/cart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cart }),
      });
      const data = await response.json();
      return data.cart || []; // Handle response and return updated cart
    } catch (error) {
      console.error("Error saving cart:", error);
    }
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    categories: [
      'beauty', 'fragrances', 'furniture', 'groceries',
      'home-decoration', 'kitchen-accessories', 'laptops',
      'mens-shirts', 'mens-shoes', 'mens-watches', 'mobile-accessories',
      'motorcycle', 'skin-care', 'smartphones', 'sports-accessories',
      'sunglasses', 'tablets', 'tops', 'vehicle',
      'womens-bags', 'womens-dresses', 'womens-jewellery',
      'womens-shoes', 'womens-watches'
    ],
    productsByCategory: {},
    loading: false,
    error: null,
    cart: [], // Cart will be managed here
  },
  reducers: {
    // Add product to the cart
    addToCart: (state, action) => {
      const itemInCart = state.cart.find(item => item.id === action.payload.id);
      if (itemInCart) {
        itemInCart.quantity += 1;
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        state.cart.push(newItem);
      }
      localStorage.setItem('cart', JSON.stringify(state.cart)); // Save to localStorage
    },
  
    // Remove product from cart
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter(item => item.id !== action.payload.id);
      localStorage.setItem('cart', JSON.stringify(state.cart)); // Update localStorage
    },
  
    // Update product quantity in the cart
    updateCartQuantity: (state, action) => {
      const item = state.cart.find(item => item.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      localStorage.setItem('cart', JSON.stringify(state.cart)); // Update localStorage
    },
  
    // Clear all items from the cart
    clearCart: (state) => {
      state.cart = [];
      localStorage.setItem('cart', JSON.stringify(state.cart)); // Update localStorage
    },
  
    // Set the entire cart (useful when fetching from backend)
    setCart: (state, action) => {
      state.cart = action.payload;
      localStorage.setItem('cart', JSON.stringify(state.cart)); // Sync with localStorage
    },
  },  
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductsByCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchProductsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.productsByCategory[action.payload.category] = action.payload.products;
      })
      .addCase(fetchProductsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload || [];
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        console.error('Error fetching cart:', action.payload);
      })
      .addCase(saveCart.fulfilled, (state, action) => {
        state.cart = action.payload || [];
      })
      .addCase(saveCart.rejected, (state, action) => {
        console.error('Error saving cart:', action.error.message);
      });
  },
});

export const { addToCart, removeFromCart, updateCartQuantity, clearCart, setCart } = productsSlice.actions;

export default productsSlice.reducer;

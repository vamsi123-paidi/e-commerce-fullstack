import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import './App.css';
import { useEffect } from 'react';
import { setCart } from './Redux/productsSlice';

import Footer from './Components/Footer';
import ProductsPage from './Components/Products';
import CartPage from './Components/Cartpage';
import Searchbar from './Components/Searchbar';
import Navbarcomponent from './Components/Navbarcomponent'

const App = () => {
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const cart = useSelector((state) => state.products.cart);
  const totalItemsInCart = cart.reduce((total, item) => total + item.quantity, 0);
  const isEmptyCart = totalItemsInCart === 0;

  useEffect(() => {
    // Load cart from localStorage
    const cartData = JSON.parse(localStorage.getItem('cart')) || [];
    dispatch(setCart(cartData)); // Dispatch to Redux store
  }, [dispatch]);


  return (
    <Router>
      <>
        <Navbarcomponent />
        <Searchbar setSearchQuery={setSearchQuery} />
        <Routes>
          <Route
            path="/"
            element={<ProductsPage searchQuery={searchQuery} />}
          />
          <Route
            path="/products/:category"
            element={<ProductsPage searchQuery={searchQuery} />}
          />
          <Route path="/cart" element={<CartPage />} />
        </Routes>
        <Footer isEmptyCart={isEmptyCart} />
      </>
    </Router>
  );
};

export default App;

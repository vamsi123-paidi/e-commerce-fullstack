const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const Cart = require('../models/cartSchema');

// Fetch Cart Route
router.get('/cart', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const cart = await Cart.findOne({ userId }).populate('items.productId');
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        res.status(200).json({ cart: cart.items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
    }
});

// Add to Cart Route
router.post('/cart', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { productId, quantity } = req.body;

        if (!productId || !quantity) {
            return res.status(400).json({ message: 'ProductId and quantity are required' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [] });
        }

        const existingItem = cart.items.find(item => item.productId.toString() === productId);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.items.push({ productId, quantity });
        }

        await cart.save();
        res.status(200).json({ message: 'Item added to cart', cart: cart.items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to add item to cart', error: error.message });
    }
});

// Update Cart Quantity Route
router.put('/cart', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { productId, quantity } = req.body;

        if (!productId || quantity === undefined) {
            return res.status(400).json({ message: 'ProductId and quantity are required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const item = cart.items.find(item => item.productId.toString() === productId);
        if (!item) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        item.quantity = quantity;
        await cart.save();
        res.status(200).json({ message: 'Cart updated', cart: cart.items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update cart', error: error.message });
    }
});

// Remove from Cart Route
router.delete('/cart', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'ProductId is required' });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Product not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        await cart.save();
        res.status(200).json({ message: 'Item removed from cart', cart: cart.items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to remove item from cart', error: error.message });
    }
});

// Clear Entire Cart Route
router.delete('/cart/all', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        cart.items = []; // Clear all items from the cart
        await cart.save();
        res.status(200).json({ message: 'Cart cleared', cart: cart.items });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to clear cart', error: error.message });
    }
});

module.exports = router;

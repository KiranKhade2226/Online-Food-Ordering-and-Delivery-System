const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Cart = require('../models/Cart');

const getCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customerId: req.user._id });
  res.json(new ApiResponse(200, cart || { customerId: req.user._id, items: [] }, 'Cart fetched'));
});

const addItem = asyncHandler(async (req, res) => {
  const { foodItemId, restaurantId, name, price, quantity = 1 } = req.body;
  const cart = await Cart.findOneAndUpdate(
    { customerId: req.user._id },
    {
      $setOnInsert: { customerId: req.user._id },
      $push: { items: { foodItemId, restaurantId, name, price, quantity } },
    },
    { new: true, upsert: true }
  );

  res.status(201).json(new ApiResponse(201, cart, 'Item added to cart'));
});

const updateItemQuantity = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ customerId: req.user._id });
  if (!cart) {
    throw new ApiError(404, 'Cart not found');
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  item.quantity = req.body.quantity;
  await cart.save();

  res.json(new ApiResponse(200, cart, 'Cart item updated'));
});

const removeItem = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { customerId: req.user._id },
    { $pull: { items: { _id: req.params.itemId } } },
    { new: true }
  );

  res.json(new ApiResponse(200, cart, 'Item removed from cart'));
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { customerId: req.user._id },
    { $set: { items: [] } },
    { new: true }
  );

  res.json(new ApiResponse(200, cart, 'Cart cleared'));
});

module.exports = { getCart, addItem, updateItemQuantity, removeItem, clearCart };

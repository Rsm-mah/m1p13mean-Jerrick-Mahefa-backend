const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'orders',
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'products',
    required: true
  },
  shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'shops',
    required: true
  },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },

  productName: { type: String, required: true },
  shopName: { type: String, required: true },
  attributes: { type: Object } 
}, { timestamps: true });

module.exports = mongoose.model('order_items', OrderItemSchema);
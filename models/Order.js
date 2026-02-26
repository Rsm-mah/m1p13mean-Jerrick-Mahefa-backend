const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'customers',
    required: true
  },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['EN COURS', 'LIVREE', 'ANNULEE'],
    default: 'EN COURS'
  }
}, { timestamps: true });

module.exports = mongoose.model('orders', OrderSchema);
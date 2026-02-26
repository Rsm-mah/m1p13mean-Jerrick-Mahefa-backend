const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'shops',
      default: null
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['ADMIN', 'SHOP'],
      default: 'SHOP'
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('users', UserSchema);
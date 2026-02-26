const mongoose = require('mongoose');

const ShopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    contacts: {
      email: {
        type: String,
        lowercase: true,
        trim: true
      },
      phone: {
        type: String,
        trim: true
      }
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

module.exports = mongoose.model('shops', ShopSchema);

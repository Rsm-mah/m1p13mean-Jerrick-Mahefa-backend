const mongoose = require('mongoose');

const DetailSchema = new mongoose.Schema(
  {
    attributes: {
      type: Object, // dynamique selon la catégorie
      required: true
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    stock: {
      type: Number,
      required: true,
      min: 0
    },

    images: {
      type: [String],
      default: []
    }
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'shops',
      required: true
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'categories',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ''
    },

    details: {
      type: [DetailSchema],
      required: true,
      validate: v => v.length > 0
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('products', ProductSchema);

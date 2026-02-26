const mongoose = require('mongoose');

const BoxSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    loyer: {
      type: Number,
      required: true,
      min: 0
    },

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'shops',
      default: null
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

module.exports = mongoose.model('box', BoxSchema);

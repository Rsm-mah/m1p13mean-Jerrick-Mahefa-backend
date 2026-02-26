const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },

  attributes: [
    {
      key: {
        type: String,
        required: true,
        trim: true
      },
      label: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['string', 'number', 'select', 'multiselect', 'boolean', 'textarea'],
        required: true
      },
      required: {
        type: Boolean,
        default: false
      },
      options: {
        type: [String],
        default: []
      }
    }
  ],

  isDeleted: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('categories', CategorySchema);
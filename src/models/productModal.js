import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({

  attributes: [
    {
      name: {
        type: String,
        required: true
      },
      value: {
        type: String,
        required: true
      }
    }
  ],

  price: {
    type: Number,
    required: true,
    min: 0
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  images: {
    primary: {
      url: {
        type: String,
        required: true
      },
      publicId: {
        type: String,
        required: true
      }
    },
    gallery: [
      {
        url: String,
        publicId: String
      }
    ]
  },

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  }

}, { _id: true });

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  slug: {
    type: String,
    unique: true,
    required: true
  },

  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  offerPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 95
  },
  minPrice: {
    type: Number
  },

  showOnHomepage: {
    type: Boolean,
    default: false
  },

  variants: [variantSchema],

  highlights: [
    {
      type: String,
      trim: true
    }
  ],

  services: [
    {
      type: String,
      trim: true
    }
  ],

  description: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    default: 0
  },

  numReviews: {
    type: Number,
    default: 0
  },

  isDeleted: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });


const Product = mongoose.model("Product", productSchema);

export default Product;
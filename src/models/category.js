import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active"
    },
    categoryOffer:{
      type: Number,
      default: 0,
      min: 0,
      max: 95
    },

    categoryImage: {
      type: String,   
      required: true
    },

    categoryImageId: {
      type: String,   
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model("Category", categorySchema)
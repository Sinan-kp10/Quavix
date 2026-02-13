import mongoose from "mongoose";

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

const addressSchema=new mongoose.Schema({
  fullname:{
    type:String,
    required:true,
    trim:true
  },
  phone:{
    type:String,
    required:true
  },
  pincode:{
    type:String,
    required:true
  },
  street:{
    type:String,
    required:true
  },
  state:{
    type:String,
    required:true
  },
  city:{
    type:String,
    required:true
  },
  addressType: {
    type: String,
    default: "home"
  }
},{_id:true});

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: false
    },

    googleId:{
        type:String,
        unique:true
    },

    referralCode: {
      type: String,
      unique: true
    },
    address:[addressSchema],

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function () {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
});

export default mongoose.model("User", userSchema);
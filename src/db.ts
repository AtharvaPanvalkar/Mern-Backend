import mongoose, { Schema, model } from "mongoose";

import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  throw new Error("MONGO_URI is not defined in .env file");
}

mongoose
  .connect(mongoURI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["User", "Admin", "Business Owner"],
    required: true,
  },
});

export const UserModel = model("User", UserSchema);


const ContentSchema = new Schema({
  multipleImages: [{ type: String, required: true }], // Array of image URLs
  name: { type: String, required: true },
  description: { type: String, required: true },
  color: { type: String, required: true },
  clothingforwho: {
    type: String,
    enum: ["Men", "Kids", "Women", "Unisex"],
    required: true,
  },
  price: { type: Number, required: true },
  available: { type: Number, required: true },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  }, // Reference to User collection
  Size: { type: String, required: true },
});

export const ContentModel = model("Content", ContentSchema);


const SellerSchema = new Schema({
  Profilepic: { type: String, required: true }, // Array of image URLs
  name: { type: String, required: true },
  location: { type: String, required: true },
  contact: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User collection
});

export const Sellerinfomodel = model("Sellerinfo", SellerSchema);


const Archived = new Schema({
 
  contentid:  {type: mongoose.Schema.Types.ObjectId,
    ref: "Content",
    required: true,},
  
  userwhoarchived: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to User collection
});

export const Archivedmodel = model("Archivedproducts", Archived);
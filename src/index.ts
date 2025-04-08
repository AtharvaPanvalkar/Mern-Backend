import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { UserModel } from "./db";

import { ContentModel } from "./db";
import { Sellerinfomodel } from "./db";
import { usermiddleware } from "./middleware";
import { Archivedmodel } from "./db";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true })); 
app.use(cors());

// })
// @ts-ignore
app.post("/api/v1/signup", async (req, res) => {
  const { username, password, role } = req.body;

  try {
    // Check if user already exists
    const existingUser = await UserModel.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }
    const JWT_PASSWORD = process.env.JWT_PASSWORD;
    if (!JWT_PASSWORD) {
      throw new Error("JWT_pass is not defined in .env file");
    }
    // Create new user if doesn't exist
    const newUser = await UserModel.create({
      username: username,
      password: password,
      role: role,
    });

    // Fetch the newly created user with their credentials
    const getid = await UserModel.findOne({ username, password });
    
    try {
      const token = jwt.sign(
        {
          // @ts-ignore
          id: getid._id,
          role: role,
        },
        JWT_PASSWORD
      );

      // Respond with success and the token
      return res.json({
        message: `USER SIGNED UP as ${role}`,
        token: token,
        role: role,
      });
    } catch (e) {
      return res.status(403).json({
        message: "Error signing up",
      });
    }
  } catch (e) {
    return res.status(411).json({
      message: "Server error",
    });
  }
});


app.post("/api/v1/signin", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const extuser = await UserModel.findOne({
    username,
    password,
    
  });
     const JWT_PASSWORD = process.env.JWT_PASSWORD;
     if (!JWT_PASSWORD) {
       throw new Error("JWT_pass is not defined in .env file");
     }
  if (extuser) {
    const token = jwt.sign(
      {
        id: extuser._id
        ,role:extuser.role
      },
      JWT_PASSWORD
    );
   
    res.json({
      message: `proper signin AS ${extuser.role}`,
      token: token,
      role:extuser.role
    });
  } else {
    res.status(403).json({
      message: "INCORRECT CREDENTIALS",
    });
  }
});

// @ts-ignore   
app.post("/api/v1/upload",usermiddleware, async(req, res) => {
   
  try {
    // const { multipleImages, name, description, price, available, owner } =
    //   req.body;
    const mi = req.body.images;
    const name = req.body.name;
    const description = req.body.description;
    const price = req.body.price;
    const available = req.body.available;
    const color=req.body.color;
     const clothingforwho = req.body.clothingforwho;
     const Size =req.body.Size;
    // @ts-ignore
    const owner = req.userID;
    if (!mi || !name || !description || !price||!color ||!clothingforwho|| !Size || available === undefined) {
      return res.status(400).json({ error: "All fields are required." });
    }

    // Ensure images are in Base64 format
    if (!Array.isArray(mi) || mi.some((img) => !img.startsWith("data:image"))) {
      return res.status(400).json({ message: "Invalid image format" });
    }

    // Save content to MongoDB
    const newcontent = await ContentModel.create({
      multipleImages: mi,
      name: name,
      description: description,
      price: price,
      available: available,
      owner: owner,
      clothingforwho:clothingforwho,
      color:color,
      Size:Size
    });

    res.json({ message: "Content uploaded successfully" + newcontent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// @ts-ignore
app.post("/api/v1/Sellerinfo",usermiddleware, async (req, res) => {
  const name = req.body.name;
  const contact = req.body.contact;
  const Profilepic = req.body.Profilepic;
  const location = req.body.location;
  // @ts-ignore
  const owner = req.userID;
  try {
    // const { multipleImages, name, description, price, available, owner } =
    //   req.body;

    // Save content to MongoDB
    const newcontent = await Sellerinfomodel.create({
      name: name,
      contact: contact,
      
      Profilepic:Profilepic,
      location: location,
      owner: owner,
    });

    res.json({ message: " Seller Content uploaded successfully" + newcontent });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/v1/contents",usermiddleware, async (req, res) => {
    // @ts-ignore
  const owner=req.userID
  try {
    const contents = await ContentModel.find({owner:owner});
    res.json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({ message: "Server error" });
  }
});
app.get("/api/v1/allcontents", async (req, res) => {
  // @ts-ignore
 
  try {
    const contents = await ContentModel.find();
    res.json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// @ts-ignore
  app.get("/api/v1/contents/:id", async (req, res) => {
    const { id } = req.params;
    const { owner } = req.query;
    

    try {
      const product = await ContentModel.findOne({ _id: id });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      const ownerInfo = await Sellerinfomodel.findOne({ owner: owner });
      if (!ownerInfo) {
        return res.status(404).json({ message: "Owner info not found" });
      }
      res.json({product,ownerInfo});
    } catch (error) {
      res.status(500).json({ message: "Server error", error });
    }
  });
  //@ts-ignore
app.get("/api/v1/seller/:id", async (req, res) => {
  const ownerID = req.params.id;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(ownerID)) {
    return res.status(400).json({ message: "Invalid owner ID" });
  }
// neet bgh seller cha id seller collectioncha to ha varch aahe
  try {
    
      const ownerInfo = await Sellerinfomodel.findOne({ _id:ownerID });

      if (!ownerInfo) {
        return res.status(404).json({ message: "Owner info not found" });
      }

    const owner = ownerInfo.owner;
    const products = await ContentModel.find({ owner: owner });
    res.json({ product: products, ownerInfo });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});
interface SearchQuery {
  q?: string;
  filter?: "all" | "store" | "product" | "location" | "color" | "Forwhom" | "desc"| "Size";
}

interface SearchResult {
  name: string;
  location?: string;
  price?: number;
}
 //@ts-ignore

app.get("/api/v1/search", async (req, res) => {
  try {
    const { query, filter } = req.query;
    if (!query) return res.json({ sellers: [], products: [], locations: [] });

    let results:any[] = [];

    if (filter === "store") {
      results = await Sellerinfomodel.find(
        { name: { $regex: query, $options: "i" } },
        "name Profilepic location contact"
      ).limit(10);
    } else if (filter === "product") {
      results = await ContentModel.find(
        { name: { $regex: query, $options: "i" } },
        "owner name color Size  description clothingforwho available price multipleImages"
      ).limit(10);
    } else if (filter === "Size") {
      results = await ContentModel.find(
        { Size: { $regex: query, $options: "i" } },
        "owner name color Size  description clothingforwho available price multipleImages"
      ).limit(10);}
      else if (filter === "location") {
      results = await Sellerinfomodel.find(
        { location: { $regex: query, $options: "i" } },
        "name Profilepic location contact"
      ).limit(10);
    } else if (filter === "color") {
      results = await ContentModel.find(
        { color: { $regex: query, $options: "i" } },
        "owner name color Size description clothingforwho available price multipleImages"
      ).limit(10);
    } else if (filter === "Forwhom") {
      results = await ContentModel.find(
        { clothingforwho: { $regex: query, $options: "i" } },
        "owner name color Size description clothingforwho available price multipleImages"
      ).limit(10);
    } else if (filter === "desc") {
      results = await ContentModel.find(
        { description: { $regex: query, $options: "i" } },
        "owner name color Size description clothingforwho available price multipleImages"
      ).limit(10);
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// Update a product
 //@ts-ignore
app.get("/api/v1/content/:id", usermiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ContentModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    //@ts-ignore
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
// PUT /api/v1/content/:id
//@ts-ignore
app.put("/api/v1/content/:id", usermiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedProduct = await ContentModel.findByIdAndUpdate(id, updateData, {
      new: true, // Returns updated document
      runValidators: true, // Ensures validation rules apply
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      //@ts-ignore
      .json({ message: "Error updating product", error: error.message });
  }
});
//@ts-ignore
app.delete("/api/v1/content/:id/images/:imageIndex", usermiddleware,async (req, res) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex, 10); // Convert imageIndex to a number

    if (isNaN(index)) {
      return res.status(400).json({ message: "Invalid image index" });
    }

    const product = await ContentModel.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (index < 0 || index >= product.multipleImages.length) {
      return res.status(400).json({ message: "Image index out of bounds" });
    }

    product.multipleImages.splice(index, 1); // Remove the image at index
    await product.save();

    res.json({
      message: "Image deleted successfully",
      images: product.multipleImages,
    });
  } catch (error) {
    res.status(500).json({ message: "Error deleting image", error });
  }
});
//@ts-ignore
app.delete("/api/v1/content/:id",usermiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const product = await ContentModel.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }


    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting product", error });
  }
});

//@ts-ignore

app.post("/api/v1/content/:id/add-image",usermiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { image } = req.body; // Base64 image

    const product = await ContentModel.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Push the new image to the multipleImages array
    product.multipleImages.push(image);
    await product.save();

    res.json({ message: "Image added successfully", image });
  } catch (error) {
    res.status(500).json({ message: "Error adding image", error });
  }
});

//@ts-ignore
app.post("/api/v1/check", usermiddleware, async (req, res) => {
  try {
    //@ts-ignore
    const owner = req.userID;

    // Find the owner info in the database
    const ownerInfo = await Sellerinfomodel.findOne({ owner: owner });

    if (!ownerInfo) {
      // If no ownerInfo is found, return a 404 error
      return res.status(404).json({ message: "Owner info not found" });
    }

    // If ownerInfo is found, return the ownerInfo in the response
    res.json(ownerInfo);
  } catch (error) {
    // Catch any errors and send a 500 error response
    res.status(500).json({ message: "Error", error });
  }
});
// Archive a product




app.listen(3000);
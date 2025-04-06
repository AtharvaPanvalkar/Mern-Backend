
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
   const JWT_PASSWORD = process.env.JWT_PASSWORD;
   if (!JWT_PASSWORD) {
     throw new Error("MONGO_URI is not defined in .env file");
   }
export const usermiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_PASSWORD);
  if (decoded) {
    //@ts-ignore
    req.userID = decoded.id;
    next();
  } else {
    res.status(403).json({
      message: "YOU ARE NOT LOGGED IN",
    });
  }
};

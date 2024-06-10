import { UserType } from "../utils/types";
import { getJwtSecretKey } from "../services/authServices";
import { getUserById } from "../services/userServices";
import { jwtVerify } from "jose";
import { Request, Response } from "express";

export const getCurrentUser: (token: string) => Promise<UserType> = async (token) => {
    const verifiedToken = await jwtVerify(token ? token : "", new TextEncoder().encode(getJwtSecretKey().toString()))
    const userId: string | unknown = verifiedToken.payload.payload as string;
    const user = await getUserById(userId);
  
    return user as UserType;
  }

export const getCurrentUserRequest = async ( req: Request, res: Response) => {
  try{
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await getCurrentUser(token);

    res.status(200).json(user);
  } catch (err){
    console.log("GET_CURRENT_USER", err);
    return res.status(500).json({message: "Internal Error"})
  }
}
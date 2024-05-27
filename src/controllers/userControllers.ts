import { UserType } from "../utils/types";
import { getJwtSecretKey } from "../services/authServices";
import { getUserById } from "../services/userServices";
import { jwtVerify } from "jose";

export const getCurrentUser: (token: string) => Promise<UserType> = async (token) => {
    const verifiedToken = await jwtVerify(token ? token : "", new TextEncoder().encode(getJwtSecretKey().toString()))
    const userId: string | unknown = verifiedToken.payload.payload as string;
    const user = await getUserById(userId);
  
    return user as UserType;
  }
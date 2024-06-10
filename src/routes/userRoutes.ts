import { Router } from "express";
import { getCurrentUserRequest } from "../controllers/userControllers";

const router = Router();

router.get('/current-user', getCurrentUserRequest);

export { router as userRouter };

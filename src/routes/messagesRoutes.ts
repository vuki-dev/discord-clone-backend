import { Router } from "express";
import { sendMessageRequest } from "../controllers/messagesControllers";

const router = Router();

router.post("/", sendMessageRequest);

export { router as messageRouter };

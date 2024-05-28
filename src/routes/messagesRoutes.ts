import { Router } from "express";
import { getMessagesRequest, sendMessageRequest } from "../controllers/messagesControllers";

const router = Router();

router.get('/', getMessagesRequest);
router.post("/send-message", sendMessageRequest);

export { router as messageRouter };

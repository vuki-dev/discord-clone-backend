import { Router } from "express";
import { deleteMessageRequest, editMessageRequest, getMessagesRequest, sendMessageRequest } from "../controllers/messagesControllers";

const router = Router();

router.get('/', getMessagesRequest);
router.post("/send-message", sendMessageRequest);
router.patch("/:id", editMessageRequest);
router.delete("/:id", deleteMessageRequest);

export { router as messageRouter };

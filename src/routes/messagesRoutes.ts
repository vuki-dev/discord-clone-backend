import { Router } from "express";
import { editOrDeleteMessageRequest, getMessagesRequest, sendMessageRequest } from "../controllers/messagesControllers";

const router = Router();

router.get('/', getMessagesRequest);
router.post("/send-message", sendMessageRequest);
router.patch("/:id", editOrDeleteMessageRequest);
router.delete("/:id", editOrDeleteMessageRequest);

export { router as messageRouter };

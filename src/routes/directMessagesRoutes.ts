import { Router } from "express";
import { editOrDeleteDirectMessageRequest, getDirectMessagesRequest, sendDirectMessageRequest } from "../controllers/directMessagesControllers";

const router = Router();

router.get('/', getDirectMessagesRequest);
router.post("/send-message", sendDirectMessageRequest);
router.patch("/:id", editOrDeleteDirectMessageRequest);
router.delete("/:id", editOrDeleteDirectMessageRequest);

export { router as directMessagesRouter };

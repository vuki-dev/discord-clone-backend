import { Router, Request, Response } from "express";
import { getCurrentUser } from "../controllers/userControllers";

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if(!token){
      return res.status(401).json({error: "Unauthorized"})
    }

    const user = await getCurrentUser(token);
    const {content, fileUrl} = req.body;
    const {serverId, channelId} = req.query;

    if(!serverId) {
      return res.status(400).json({error: "Server ID is missing"})
    }

    if(!channelId) {
      return res.status(400).json({error: "Channel ID is missing"})
    }

    if(!content) {
      return res.status(400).json({error: "Content is missing"})
    }

    console.log("~", content, fileUrl);
    console.log("~server id " + serverId + "\n~channel id " + channelId);
    console.log(user)

    res.json('Hello d-clone!');
  } catch (err) {
    console.log("MESSAGES_POST", err)
    return res.status(500).json({message: "Internal error"})
  }
  });

export {router as messageRouter}
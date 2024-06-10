import dotenv from "dotenv";
dotenv.config();

import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import {messageRouter} from "./routes/messagesRoutes";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { directMessagesRouter } from "./routes/directMessagesRoutes";
import { userRouter } from "./routes/userRoutes";

declare global {
  namespace Express {
    interface Response {
      io?: Server;
    }
  }
}

const app = express()
const server = http.createServer(app);

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;

app.use((req, res, next) => {
  res.io = io;
  next();
});

app.use('/api/messages', messageRouter);
app.use('/api/direct-messages', directMessagesRouter);
app.use('/api/users', userRouter);


io.on('connection', (socket: any) => {
  console.log("a user connected");

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
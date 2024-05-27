import express from "express";
import * as http from "http";
import { Server } from "socket.io";
import {messageRouter} from "./routes/messagesRoutes";

const app = express()
const server = http.createServer(app);


const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const port = process.env.PORT || 4000;

app.use('/api/messages', messageRouter);

io.on('connection', (socket: any) => {
  console.log("a user connected");

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
})

server.listen(port, () => {
  console.log(`server listening on port ${port}`)
})
import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import http from 'http'
import { Server } from 'socket.io';
import sql from './config/db.js';
//import { initSocket } from './sockets/index.js';
const app = express();
app.use(express.json())
app.use(cors());
app.use(cookieParser());


async function start() {
    const res = await sql`SELECT NOW()`;
    console.log("Connected:", res[0].now);
}
start();
//socket.io setup -- reminder for later -- incase I forget
const server = http.createServer(app)

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    }
});

app.set("io", io);
//initSocket(io);
const port = process.env.PORT || 3000
server.listen(port, () => console.log('Server running on http://localhost:' + port));
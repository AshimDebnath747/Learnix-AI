import express from 'express';
import cors from 'cors';
import cookieParser from "cookie-parser";
import http from 'http'
import { Server } from 'socket.io';
import morgan from 'morgan';
import registerRoutes from './routes/auth/register.routes.js'
import routineRoutes from './routes/routine/routine.route.js';
import errorMiddleware from './middlewares/errorMiddleware.js';

//import { initSocket } from './sockets/index.js';
const app = express();
app.use(morgan("dev"))
app.use(express.json())
app.use((req, res, next) => {
    console.log("Body:", req.body); // 👈 add this temporarily
    next();
});
app.use(cors());
app.use(cookieParser());




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

// Registration,login

app.use('/api/auth', registerRoutes)
app.use('/api/routine', routineRoutes)







//Error handling middleware
app.use(errorMiddleware);

const port = process.env.PORT || 3000
server.listen(port, () => console.log('Server running on http://localhost:' + port));
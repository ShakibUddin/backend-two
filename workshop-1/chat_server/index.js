const express = require("express");
const { db } = require("./database");
const userRouter = require("./routes/user.routes");
const verifyToken = require("./middlewares/auth");
const messageRouter = require("./routes/message.routes");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const channelRouter = require("./routes/channel.routes");

require("dotenv").config();

const app = express();

app.use(express.json());

app.use(cors())

app.use("/user", userRouter);
app.use("/message", verifyToken, messageRouter);
app.use("/channel", verifyToken, channelRouter);

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "*"
    }
});

// Handle socket connections
io.on("connection", (socket) => {
    
    // Listen for message events on this socket connection
    socket.on("message", (data) => {        
        // Broadcast the message to all connected clients (if needed)
        io.emit("message", data);
    });

    socket.on("channel", (data) => {        
        io.emit("channel", data);
    });
});


// Increase the limit of listeners if needed (optional, but generally not recommended)
io.setMaxListeners(20); // You can adjust this number

httpServer.listen(process.env.PORT, async () => {
    console.log(`Example app listening on port ${process.env.PORT}`);
    try {
        await db.getConnection();
        console.log(`Connection to database has been established successfully.`);
    } catch (error) {
        console.log("Unable to connect to the database:", error);
    }
});

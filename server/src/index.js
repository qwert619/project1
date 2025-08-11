import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import Server from "socket.io"

// Configure dotenv
dotenv.config();

import { userRouter } from "./routes/users.js";
//import { recipesRouter } from "./routes/recipes.js";

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;
const MONGODB_URI = process.env.MONGODB_URI;

const __dirname = path.resolve();

const allowedOrigins = [
  "https://bakerypage.onrender.com", // your frontend URL
  "http://localhost:3000"            // for local development
];

app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

//app.use("/lobby", userRouter);
app.use("/users", userRouter);
app.get("/healthz", (req, res) => res.send("OK"));

mongoose.connect(MONGODB_URI)

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const activeLobbies = new Map();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("createLobby", (lobbyID, restaurantID) => {
    if (activeLobbies.has(lobbyID)) {
      socket.emit("lobbyError", "Lobby already exists");
      return;
    }
    activeLobbies.set(lobbyID, { host: socket.id, members: [socket.id], restaurants: [{ id: restaurantID, yes: false }], finished: false });
    socket.join(lobbyID);
    console.log(`Lobby ${lobbyID} created by ${socket.id}`);

    socket.emit("lobbyCreated", { lobbyCode });
  });

  socket.on("joinLobby", (lobbyID) => {
    if (!activeLobbies.has(lobbyID)) {
      socket.emit("lobbyError", "Lobby does not exist");
      return;
    }
    activeLobbies.get(lobbyID).members.push(socket.id);
    socket.join(lobbyID);
    console.log(`User ${socket.id} joined lobby: ${lobbyID}`);
    io.to(lobbyID).emit("system", `${socket.id} joined the lobby`);
  });



  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});




server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

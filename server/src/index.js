import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import http from "http";
import {Server} from "socket.io"

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
  "http://localhost:3000",
  "http://localhost:3001"            // for local development
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

  socket.on("createLobby", (lobbyID, restaurants) => {
    if (activeLobbies.has(lobbyID)) {
      socket.emit("lobbyError", "Lobby already exists");
      return;
    }

    activeLobbies.set(lobbyID, {
      host: socket.id,
      members: [
        {
          member: socket.id,
          restaurants: restaurants.map(restaurant => ({ restaurant, yes: null })), // use null as undecided
        }
      ],
      finished: false,
    });

    socket.join(lobbyID);
    console.log(`Lobby ${lobbyID} created by ${socket.id}`);

    socket.emit("lobbyCreated", Array.from(activeLobbies.entries()));
  });

  socket.on("joinLobby", (lobbyID) => {
    if (!activeLobbies.has(lobbyID)) {
      socket.emit("lobbyError", "Lobby does not exist");
      return;
    }

    const lobby = activeLobbies.get(lobbyID);

    if (!lobby.members.some(m => m.member === socket.id)) {
      const copyofRestaurants = lobby.members[0]?.restaurants || [];
      // Clone restaurants and reset votes to null
      const updatemember = copyofRestaurants.map(item => ({ restaurant: item.restaurant, yes: null }));
      lobby.members.push({ member: socket.id, restaurants: updatemember });
    }

    socket.join(lobbyID);
    console.log(`User ${socket.id} joined lobby: ${lobbyID}`);

    io.to(lobbyID).emit("system", lobby.members[0]?.restaurants.map(item => item.restaurant));
  });

  socket.on("swipe", (yes, restaurant, lobbyID) => {
    const lobby = activeLobbies.get(lobbyID);
    if (!lobby) return;

    const member = lobby.members.find(m => m.member === socket.id);
    if (!member) return;

    // Match restaurant by ID
    const restaurantData = member.restaurants.find(r => r.restaurant.place_id === restaurant.place_id);
    if (!restaurantData) return;

    restaurantData.yes = yes;

    // Check if all members have voted on all restaurants (no null votes)
    const allVoted = lobby.members.every(m =>
      m.restaurants.every(r => r.yes !== null)
    );

  const firstMemberRestaurants = lobby.members[0]?.restaurants || [];

// Find the first restaurant where every member voted yes
  const matchingRestaurant = firstMemberRestaurants.find(rest =>
    lobby.members.every(member =>
      member.restaurants.some(r =>
        r.restaurant.place_id === rest.restaurant.place_id && r.yes === true
      )
    )
  );

    if (allVoted) {
      lobby.finished = true;
      io.to(lobbyID).emit("swipeResult", lobby.members[0]?.restaurants);
      console.log(`Lobby ${lobbyID} finished by ${socket.id}`);
    }
    else if (matchingRestaurant) {
      io.to(lobbyID).emit("swipeResult", {winner: matchingRestaurant});
    } else {
      io.to(lobbyID).emit("swipeResult", "No Matches found");
    }

    
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
import mongoose from "mongoose";

const lobbySchema = new mongoose.Schema({
    lobbyID: {type: String, required: true, unique: true},
    RestaurantID: [{type: String, required: true}],
    UserID: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}]
})

export const Lobby = mongoose.model("Lobby", lobbySchema);
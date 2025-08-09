import mongoose from "mongoose";

const lobbySchema = new mongoose.Schema({
    lobbyID: {type: String, required: true, unique: true},
    guestplaces: [{
            place_id: { type: String },
            name: { type: String },
            formatted_address: { type: String },
            business_status: { type: String },
            formatted_phone_number: { type: String },
            regular_opening_hours: { type: mongoose.Schema.Types.Mixed }, // can be object/array
            website: { type: String },
            rating: { type: Number },
            price_level: { type: Number },
            photos: { type: mongoose.Schema.Types.Mixed }, // can be array/object
            url: { type: String }
        }],
    UserID: [{type: mongoose.Schema.Types.ObjectId, ref: "User"}],
    lobbyisDone: {type: Boolean, default: false}
})

export const Lobby = mongoose.model("Lobby", lobbySchema);
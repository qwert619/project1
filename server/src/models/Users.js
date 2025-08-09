import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    guestusername: { type: String, required: true},
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
    lobbyID: { type: String, unique: true }
});

export const userModel = mongoose.model("User", userSchema);
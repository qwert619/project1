import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    guestusername: {type: String, required: true, unique: true},
    guestplaces: [{
        displayName: { type: String },
        location: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true }
        },
        businessStatus: { type: String }

    }],
});

export const userModel = mongoose.model("User", userSchema);
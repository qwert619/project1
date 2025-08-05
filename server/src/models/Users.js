import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    guestusernumber: {type: Number, required: true, unique: true}
});

export const userModel = mongoose.model("User", userSchema);
import { isValidObjectId } from "mongoose";
import { userModel } from "../models/Users.js";
import express from "express";

export const userRouter = express.Router();

userRouter.post("/", async (req, res) => {
    try {
        const newUser = new userModel(req.body);
        await newUser.save();
        res.json({ userID: newUser._id, guestusername: newUser.guestusername });
    } catch (error) {
        console.error("Error creating user:", error);
    }
});

userRouter.get("/:userID", async (req, res) => {
    try{
        let validUser = isValidObjectId(req.params.userID) ? await userModel.findById(req.params.userID) : false;
        res.json({ validUser })

    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send("Internal Server Error");
    }
});

userRouter.put("/", async (req, res) => {
    try {
        const { userID, guestusername } = req.body;
        const user = await userModel.findByIdAndUpdate(userID, { guestusername }, { new: true });
        res.json({ guestusername: user.guestusername });
    } catch (error) {
        console.error("Error updating user:", error);
    }
});

userRouter.put("/location", async (req, res) => {
    try {
        
        const userID = req.body.userID;
        const guestplaces = req.body.places;
        const setplaces = await userModel.findByIdAndUpdate(
            userID, { guestplaces }, { new: true }
        );
        res.json({setplaces});
    } catch (error) {
        console.error("Error updating user places:", error);
        res.status(500).send("Internal Server Error");
    }
});
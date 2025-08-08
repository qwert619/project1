import { isValidObjectId } from "mongoose";
import { userModel } from "../models/Users.js";
import express from "express";
import dotenv from "dotenv";
dotenv.config();
import axios from "axios";
const apiKey = process.env.GOOGLE_MAPS_API_KEY;

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

/*userRouter.put("/location", async (req, res) => {
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
});*/

userRouter.get("/location/:userID", async (req, res) => {

    try{
        const userID = req.params.userID;
        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({ message: `User not found ${userID}` });
        }
        res.json({ guestplaces: user.guestplaces || []});
    } catch (error) {
        console.error("Error fetching user locations:", error);
        res.status(500).send("Internal Server Error");
    }
});



userRouter.put('/location', async (req, res) => {
  try {
    const { userID, places } = req.body;
    const placeIds = places.map(place => place.id || place.place_id);

    // Fetch details for each place_id
    const detailsArray = await Promise.all(
      placeIds.map(async (place_id) => {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
          params: {
            place_id,
            fields: 'place_id,name,formatted_address,business_status,formatted_phone_number,current_opening_hours,website,rating,price_level,photos,url',
            key: apiKey
          }
        });
        if (!response.data.result) {
          console.error("No result for place_id:", place_id, response.data);
        }
        return response.data.result;
      })
    );

    // Save all place details to the user
    const setPlacesDetails = await userModel.findByIdAndUpdate(
      userID,
      { $set: { guestplaces: detailsArray } },
      { new: true }
    );

    res.json({ guestplaces: setPlacesDetails.guestplaces });
  } catch (error) {
    console.error("Google API error:", error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch place details', details: error.response?.data });
  }
});

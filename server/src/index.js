import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

const app = express();
 
const databaseurl = 'mongodb://localhost:27017/datebite';

app.use(cors());
app.use(express.json());

app.

app.connect(3002, console.log('Server is running on port 3002'));
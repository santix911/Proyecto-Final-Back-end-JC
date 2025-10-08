const express = require('express');
const app = express();
const mongoose = require('mongoose');

app.use(express.json());

const mongooseURI = "mongodb+srv://ProyectoPrueba:stHfUtQDM7sIpFJL@prueba.ukjmu8h.mongodb.net/?retryWrites=true&w=majority&appName=Prueba";

const connectDB = async () => {
  try {
    await mongoose.connect(mongooseURI);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

connectDB();

const Juego = require('./Modelo/juego');
const Resenia = require('./Modelo/resenia');

app.listen(3000, () => {
  console.log('API GameTracker en http://localhost:3000');
});
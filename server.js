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

app.get('/api/juegos', async (req, res) => {
  try {
    const { genero, plataforma, completado } = req.query;
    let filtro = {};

    if (genero) filtro.genero = genero;
    if (plataforma) filtro.plataforma = plataforma;
    if (completado !== undefined) filtro.completado = completado === 'true';

    const juegos = await Juego.find(filtro);
    res.json(juegos);
  } catch (error) {
    console.error("Error al obtener juegos:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/juegos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const juego = await Juego.findById(id);
    if (!juego) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }
    res.json(juego);
  } catch (error) {
    console.error("Error al obtener juego:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post('/api/juegos', async (req, res) => {
  try {
    const { titulo, genero, plataforma, añoLanzamiento, desarrollador, imagenPortada, descripcion, completado } = req.body;

    if (!titulo || !genero || !plataforma) {
      return res.status(400).json({
        error: "Faltan datos del juego. Se requiere título, género y plataforma"
      });
    }

    const nuevoJuego = new Juego({
      titulo,
      genero,
      plataforma,
      añoLanzamiento,
      desarrollador,
      imagenPortada,
      descripcion,
      completado
    });

    const juegoGuardado = await nuevoJuego.save();

    res.status(201).json({
      mensaje: "Juego agregado a tu colección",
      juego: juegoGuardado
    });
  } catch (error) {
    console.error("Error al guardar el juego:", error.message);
    res.status(400).json({
      error: "Error al guardar el juego",
      mensaje: error.message
    });
  }
});

app.listen(3000, () => {
  console.log('API GameTracker en http://localhost:3000');
});
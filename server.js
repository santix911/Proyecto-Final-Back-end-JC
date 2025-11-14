require('dotenv').config();

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');

const PORT = process.env.PORT || 3001;

app.use(cors());

app.use(express.json());

const mongooseURI = process.env.MONGODB_URI;

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

app.put('/api/juegos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, genero, plataforma, añoLanzamiento, desarrollador, imagenPortada, descripcion, completado } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const juegoActualizado = await Juego.findByIdAndUpdate(
      id,
      { titulo, genero, plataforma, añoLanzamiento, desarrollador, imagenPortada, descripcion, completado },
      { new: true, runValidators: true }
    );

    if (!juegoActualizado) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    res.json({
      mensaje: 'Información del juego actualizada exitosamente',
      juego: juegoActualizado
    });
  } catch (error) {
    console.error("Error al actualizar juego:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete('/api/juegos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const juegoEliminado = await Juego.findByIdAndDelete(id);

    if (!juegoEliminado) {
      return res.status(404).json({ error: "Juego no encontrado" });
    }

    await Resenia.deleteMany({ juegoId: id });

    const juegosRestantes = await Juego.countDocuments();

    res.json({
      mensaje: "Juego removido de tu biblioteca",
      juego: {
        id: juegoEliminado._id,
        titulo: juegoEliminado.titulo
      },
      juegosRestantes: juegosRestantes
    });
  } catch (error) {
    console.error("Error eliminando juego:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/resenias', async (req, res) => {
  try {
    const resenias = await Resenia.find().populate('juegoId');
    res.json(resenias);
  } catch (error) {
    console.error("Error al obtener reseñas:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.get('/api/resenias/juego/:juegoId', async (req, res) => {
  try {
    const { juegoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(juegoId)) {
      return res.status(400).json({ error: "ID de juego no válido" });
    }

    const resenias = await Resenia.find({ juegoId }).populate('juegoId');
    res.json(resenias);
  } catch (error) {
    console.error("Error al obtener reseñas:", error.message);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.post('/api/resenias', async (req, res) => {
  try {
    const { juegoId, puntuacion, textoReseña, horasJugadas, dificultad, recomendaria } = req.body;

    if (!juegoId || !puntuacion || !textoReseña) {
      return res.status(400).json({
        error: "Faltan datos de la reseña. Se requiere juegoId, puntuación y texto"
      });
    }

    const juegoExiste = await Juego.findById(juegoId);
    if (!juegoExiste) {
      return res.status(404).json({ error: "El juego especificado no existe" });
    }

    const nuevaResenia = new Resenia({
      juegoId,
      puntuacion,
      textoReseña,
      horasJugadas,
      dificultad,
      recomendaria
    });

    const reseniaGuardada = await nuevaResenia.save();

    res.status(201).json({
      mensaje: "Reseña guardada con éxito",
      resenia: reseniaGuardada
    });
  } catch (error) {
    console.error("Error al guardar la reseña:", error.message);
    res.status(400).json({
      error: "Error al guardar la reseña",
      mensaje: error.message
    });
  }
});

app.put('/api/resenias/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { juegoId, puntuacion, textoReseña, horasJugadas, dificultad, recomendaria } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const reseniaActualizada = await Resenia.findByIdAndUpdate(
      id,
      { juegoId, puntuacion, textoReseña, horasJugadas, dificultad, recomendaria },
      { new: true, runValidators: true }
    );

    if (!reseniaActualizada) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    res.json({
      mensaje: 'Reseña actualizada exitosamente',
      resenia: reseniaActualizada
    });
  } catch (error) {
    console.error("Error al actualizar reseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.delete('/api/resenias/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID no válido" });
    }

    const reseniaEliminada = await Resenia.findByIdAndDelete(id);

    if (!reseniaEliminada) {
      return res.status(404).json({ error: "Reseña no encontrada" });
    }

    res.json({
      mensaje: "Reseña eliminada exitosamente",
      resenia: {
        id: reseniaEliminada._id,
        juegoId: reseniaEliminada.juegoId,
        puntuacion: reseniaEliminada.puntuacion
      }
    });
  } catch (error) {
    console.error("Error eliminando reseña:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.use((error, req, res, next) => {
  if (error.name === "ValidationError") {
    const mensaje = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({ error: "Error de validación", mensajes: mensaje });
  }
  if (error.code === 11000) {
    return res.status(400).json({ error: "Dato duplicado" });
  }
  res.status(500).json({ error: "Error interno del servidor" });
});

app.listen(PORT, () => {
  console.log(`API GameTracker en http://localhost:${PORT}`);
});
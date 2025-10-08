const mongoose = require('mongoose');

const juegoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'El título del juego es obligatorio'],
        trim: true,
        minlength: [1, 'El título debe tener al menos 1 carácter'],
        maxlength: [100, 'El título no puede exceder 100 caracteres']
    },
    genero: {
        type: String,
        required: [true, 'El género es obligatorio'],
        trim: true,
        enum: {
            values: ['Acción', 'Aventura', 'RPG', 'Estrategia', 'Deportes', 'Simulación', 'Puzzle', 'Horror', 'Shooter', 'Otro'],
            message: '{VALUE} no es un género válido'
        }
    },
    plataforma: {
        type: String,
        required: [true, 'La plataforma es obligatoria'],
        trim: true,
        enum: {
            values: ['PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'Otra'],
            message: '{VALUE} no es una plataforma válida'
        }
    },
    añoLanzamiento: {
        type: Number,
        min: [1970, 'El año debe ser 1970 o posterior'],
        max: [new Date().getFullYear() + 2, 'El año no puede ser muy futuro']
    },
    desarrollador: {
        type: String,
        trim: true,
        maxlength: [100, 'El nombre del desarrollador no puede exceder 100 caracteres']
    },
    imagenPortada: {
        type: String,
        default: 'https://via.placeholder.com/300x400?text=Sin+Portada'
    },
    descripcion: {
        type: String,
        trim: true,
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    completado: {
        type: Boolean,
        default: false
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

const Juego = mongoose.model('Juego', juegoSchema);

module.exports = Juego;
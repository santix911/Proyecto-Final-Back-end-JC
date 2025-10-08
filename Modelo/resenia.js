const mongoose = require('mongoose');

const reseniaSchema = new mongoose.Schema({
    juegoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Juego',
        required: [true, 'La reseña debe estar asociada a un juego']
    },
    puntuacion: {
        type: Number,
        required: [true, 'La puntuación es obligatoria'],
        min: [1, 'La puntuación mínima es 1 estrella'],
        max: [5, 'La puntuación máxima es 5 estrellas'],
        validate: {
            validator: Number.isInteger,
            message: 'La puntuación debe ser un número entero'
        }
    },
    textoReseña: {
        type: String,
        required: [true, 'El texto de la reseña es obligatorio'],
        trim: true,
        minlength: [10, 'La reseña debe tener al menos 10 caracteres'],
        maxlength: [1000, 'La reseña no puede exceder 1000 caracteres']
    },
    horasJugadas: {
        type: Number,
        min: [0, 'Las horas jugadas no pueden ser negativas'],
        default: 0
    },
    dificultad: {
        type: String,
        enum: {
            values: ['Fácil', 'Normal', 'Difícil'],
            message: '{VALUE} no es una dificultad válida'
        }
    },
    recomendaria: {
        type: Boolean,
        default: true
    },
    fechaCreacion: {
        type: Date,
        default: Date.now
    },
    fechaActualizacion: {
        type: Date,
        default: Date.now
    }
});

reseniaSchema.pre('findOneAndUpdate', function(next) {
    this.set({ fechaActualizacion: new Date() });
    next();
});

const Resenia = mongoose.model('Resenia', reseniaSchema);

module.exports = Resenia;
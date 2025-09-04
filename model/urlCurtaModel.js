const mongoose = require('mongoose');

const urlCurtaSchema = new mongoose.Schema({
    urlLonga: {
        type: String,
        required: true,
        trim: true
    },
    hashcode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

// Índices para melhor performance
urlCurtaSchema.index({ hashcode: 1 });
urlCurtaSchema.index({ urlLonga: 1 });

module.exports = mongoose.model('UrlCurta', urlCurtaSchema);
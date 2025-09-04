const mongoose = require('mongoose');

const urlCurtaSchema = new mongoose.Schema({
    urlLonga: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                try{
                    const url = new URL(v);
                    return ['http:', 'https:'].includes(url.protocol);
                } catch(err) {
                    return false;
                }
            }
        }
    },
    hashcode: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 5,
        maxlength: 7
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
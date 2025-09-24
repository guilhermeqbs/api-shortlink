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
            },
            message: 'URL deve ser válida e usar protocolo HTTP ou HTTPS'
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


urlCurtaSchema.index({ urlLonga: 1 });
urlCurtaSchema.index({ criadoEm: -1 });

module.exports = mongoose.model('UrlCurta', urlCurtaSchema);
const UrlCurta = require("../model/urlCurtaModel");
const { nanoid } = require("nanoid");
const axios = require("axios");
const logger = require("../config/logger");

// Gera hashcode único
async function gerarHashUnico(tamanho = 6, tentativas = 5) {
    for (let i = 0; i < tentativas; i++) {
        const hash = nanoid(tamanho);
        const existe = await UrlCurta.findOne({ hashcode: hash }).lean();
        if (!existe) return hash;
    }
    return null;
}

// Validação reCAPTCHA
async function validarRecaptcha(token) {
    if (!token) return false;
    
    try {
        const response = await axios.post(
            process.env.RECAPTCHA_VERIFY_URL,
            null,
            { params: { secret: process.env.RECAPTCHA_SECRET_KEY, response: token } }
        );
        
        return response.data.success && response.data.score > 0.6;
    } catch (error) {
        logger.error('reCAPTCHA error:', error.message);
        return false;
    }
}

exports.create = async (req, res) => {
    try {
        const { url, recaptchaToken } = req.body;
        
        // Validação reCAPTCHA
        if (!await validarRecaptcha(recaptchaToken)) {
            return res.status(400).json({ 
                error: "Falha na verificação de segurança" 
            });
        }
        
        // Verifica URL existente
        const urlExistente = await UrlCurta.findOne({ urlLonga: url }).lean();
        if (urlExistente) {
            return res.json({ 
                urlCurta: `${req.protocol}://${req.get('host')}/${urlExistente.hashcode}`,
                hashcode: urlExistente.hashcode
            });
        }

        // Gera novo hash
        const hashcode = await gerarHashUnico();
        if (!hashcode) {
            return res.status(500).json({ 
                error: "Erro ao gerar URL encurtada" 
            });
        }

        // Cria URL
        const novaUrl = await UrlCurta.create({ urlLonga: url, hashcode });
        
        res.status(201).json({ 
            urlCurta: `${req.protocol}://${req.get('host')}/${novaUrl.hashcode}`,
            hashcode: novaUrl.hashcode
        });

    } catch (error) {
        logger.error('Create URL error:', error.message);
        res.status(500).json({ error: "Erro interno do servidor" });
    }
}

exports.redirect = async (req, res) => {
    try {
        const { hashcode } = req.params;
        
        const urlCurta = await UrlCurta.findOne({ hashcode }).lean();
        
        if (!urlCurta) {
            return res.status(404).json({ error: "URL não encontrada" });
        }
        
        res.redirect(301, urlCurta.urlLonga);
        
    } catch (error) {
        logger.error('Redirect error:', error.message);
        res.status(404).json({ error: "URL não encontrada" });
    }
}

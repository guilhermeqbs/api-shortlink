const UrlCurta = require("../model/urlCurtaModel");
const { nanoid } = require("nanoid");
const axios = require("axios");

//garante que o hashcode gerado seja único e que tenha um tamanho entre 5 e 7 
async function gerarHashUnico(tamanhoMin = 5, tamanhoMax = 7, maxTentativas = 5) {
    for (let tamanho = tamanhoMin; tamanho <= tamanhoMax; tamanho++) {
        for (let i = 0; i < maxTentativas; i++) {
            const hash = nanoid(tamanho);
            const existe = await UrlCurta.findOne({ hashcode: hash }).lean();
            if (!existe) return hash;
        }
    }
    return null;
}

// Função para validar reCAPTCHA
async function validarRecaptcha(token) {
    if (!token) return false;
    
    try {
        const secretKey = process.env.RECAPTCHA_SECRET_KEY || "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // chave de teste
        
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: secretKey,
                response: token
            }
        });
        
        const data = response.data;
        
        // Verificar se é válido e tem score aceitável (> 0.5)
        return data.success && data.score > 0.5;
    } catch (error) {
        console.error('Erro ao validar reCAPTCHA:', error);
        return false;
    }
}


exports.create = async (req, res) => {
    try {
        let { url, recaptchaToken } = req.body;
        
        // Validação reCAPTCHA
        const recaptchaValido = await validarRecaptcha(recaptchaToken);
        if (!recaptchaValido) {
            return res.status(400).json({ error: "Falha na verificação de segurança" });
        }
        
        // Validação URL
        if (!url || !url.trim()) {
            return res.status(400).json({ error: "URL é obrigatória" });
        }

        // Adiciona protocolo se não tiver
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = `https://${url}`;
        }

        // Validação de formato de URL
        try {
            new URL(url);
        } catch {
            return res.status(400).json({ error: "URL inválida" });
        }

        const urlCurtaExistente = await UrlCurta.findOne({ urlLonga: url }).lean();

        const dominio = `${req.protocol}://${req.get('host')}`;
        if (urlCurtaExistente) {
            return res.json({ urlCurta: `${dominio}/${urlCurtaExistente.hashcode}` });
        }

        const hashcode = await gerarHashUnico();
        if (!hashcode) {
            return res.status(500).json({ error: "Falha ao gerar url encurtada, tente novamente." });
        }

        const novaUrlCurta = await UrlCurta.create({ urlLonga: url, hashcode });
        return res.json({ urlCurta: `${dominio}/${novaUrlCurta.hashcode}` });

    } catch (error) {
        console.error('Erro ao criar URL:', error);
        return res.status(500).json({ error: "Erro ao encurtar URL" });
    }
}

exports.redirect = async (req, res) => {
    try {
        const hashcode = req.params.hashcode;
        
        // Validação do formato do hashcode
        if (!hashcode || !/^[a-zA-Z0-9]{5,7}$/.test(hashcode)) {
            return res.status(404).json({ error: "URL não encontrada" });
        }
        
        const urlCurta = await UrlCurta.findOne({ hashcode }).lean();
        if (!urlCurta) {
            return res.status(404).json({ error: "URL não encontrada" });
        }
        return res.redirect(301, urlCurta.urlLonga);
    } catch (error) {
        console.error('Erro ao redirecionar:', error);
        return res.status(500).json({ error: "Erro ao redirecionar URL" });
    }
}

// Função para validar e normalizar a URL
function validarUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;

    let url = raw.trim();

    // Remove caracteres como "<>" se o usuário colar algo como "<http://...>"
    if (url.startsWith('<') && url.endsWith('>')) {
        url = url.slice(1, -1).trim();
    }

    // Adiciona protocolo se não tiver
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    // Valida o formato da URL
    try {
        return new URL(url).toString(); // Retorna a URL normalizada
    } catch {
        return null; // Retorna null se a URL for inválida
    }
}
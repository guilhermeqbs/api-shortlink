const { body, param, validationResult } = require('express-validator');

// Middleware de erro de validação
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            error: 'Dados inválidos',
            details: errors.array().map(err => err.msg)
        });
    }
    next();
};

// Validação para criar URL
const validateCreateUrl = [
    body('url')
        .trim()
        .notEmpty()
        .withMessage('URL é obrigatória')
        .isURL()
        .withMessage('URL deve ser válida')
        .isLength({ max: 2048 })
        .withMessage('URL muito longa')
        .customSanitizer((value) => {
            if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                return `https://${value}`;
            }
            return value;
        }),
    
    body('recaptchaToken')
        .trim()
        .notEmpty()
        .withMessage('Token reCAPTCHA obrigatório'),
    
    handleValidationErrors
];

// Validação para hashcode
const validateHashcode = [
    param('hashcode')
        .trim()
        .matches(/^[a-zA-Z0-9_-]{5,7}$/)
        .withMessage('Hashcode inválido'),
    
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(404).json({ error: 'URL não encontrada' });
        }
        next();
    }
];

module.exports = {
    validateCreateUrl,
    validateHashcode
};

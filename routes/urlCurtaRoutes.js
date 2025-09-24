const express = require("express");
const router = express.Router();
const UrlCurtaController = require("../controller/urlCurtaController");
const { validateCreateUrl, validateHashcode } = require("../middleware/validation");

// Rota para criar URL encurtada
router.post('/shorten', validateCreateUrl, UrlCurtaController.create);

// Rota para redirect
router.get('/:hashcode', validateHashcode, UrlCurtaController.redirect);

module.exports = router;
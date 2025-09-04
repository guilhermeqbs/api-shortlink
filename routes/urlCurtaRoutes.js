const express = require("express");
const router = express.Router();
const UrlCurtaController = require("../controller/urlCurtaController");

// Rota para criar URL encurtada
router.post('/shorten', UrlCurtaController.create);

// Rota para redirect (regex simplificada)
router.get('/:hashcode', UrlCurtaController.redirect);

module.exports = router;
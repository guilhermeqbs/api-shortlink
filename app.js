const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const urlCurtaRoutes = require('./routes/urlCurtaRoutes');
const app = express();
const PORT = process.env.PORT || 5000;
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');


app.use(cors({
  origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

app.use(helmet());

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
   message: 'Muitas tentativas, tente novamente em 15 minutos'
});

const redirectLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 50, // Mais permissivo para redirects
  message: 'Muitos acessos, aguarde 1 minuto'
});

// Aplicar rate limiters ANTES das rotas
app.use('/api/shorten', createLimiter);
app.use('/:hashcode', redirectLimiter);

mongoose.connect('mongodb://localhost:27017/shortener', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rota da API para criação (prefixo /api)
app.use('/api', urlCurtaRoutes);
// Rotas de redirect direto (sem prefixo) para acesso via hashcode
app.use('/', urlCurtaRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Algo deu errado!' });
}); 

// Rota 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
}); 

app.listen(PORT, () => {
  console.log(`Servidor na porta ${PORT}`);
});

module.exports = app;
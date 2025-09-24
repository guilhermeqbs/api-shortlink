require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');

const urlCurtaRoutes = require('./routes/urlCurtaRoutes');
const logger = require('./config/logger');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(helmet());

// Logging com Morgan
app.use(morgan('combined', { stream: logger.stream }));

// Rate limiting
app.use('/api/shorten', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  message: { error: 'Muitas tentativas, aguarde 15 minutos' }
}));

app.use('/:hashcode', rateLimit({
  windowMs: 60 * 1000, // 1 minuto  
  max: 50,
  message: { error: 'Muitos acessos, aguarde 1 minuto' }
}));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => logger.info('Conectado ao MongoDB'))
  .catch(err => {
    logger.error('Erro MongoDB:', err.message);
    process.exit(1);
  });

// Health check
app.get('/health', async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString() 
    });
  }
});

// Rota da API para criação (prefixo /api)
app.use('/api', urlCurtaRoutes);
// Rotas de redirect direto (sem prefixo) para acesso via hashcode
app.use('/', urlCurtaRoutes);

// Middleware de erro simples
app.use((err, req, res, next) => {
    logger.error('Server Error:', err.message);
    res.status(500).json({ error: 'Erro interno do servidor' });
}); 

// 404
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
}); 

app.listen(PORT, () => {
  logger.info(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;
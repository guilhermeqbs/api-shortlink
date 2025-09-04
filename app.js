const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const urlCurtaRoutes = require('./routes/urlCurtaRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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
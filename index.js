require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const db = require('./models');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();
const PORT = 3500;

app.use(bodyParser.json());

// Rota da Documentação
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/auth', authRoutes); 
app.use('/order', orderRoutes);

db.sequelize.sync()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor rodando na porta ${PORT}`);
            console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
        });
    })
    .catch(err => {
        console.error('Erro ao conectar ou sincronizar o banco de dados:', err);
    });
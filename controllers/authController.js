// /controllers/authController.js

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET; 

exports.login = (req, res) => {
    const { apiKey } = req.body; 

    if (apiKey === SECRET_KEY) {
        const token = jwt.sign(
            { user: 'jitterbit-user', role: 'admin' },
            SECRET_KEY,
            { expiresIn: '1h' } 
        );

        return res.status(200).json({ 
            message: 'Autenticação bem-sucedida', 
            token: token 
        });
    }

    return res.status(401).json({ error: 'Credenciais inválidas.' });
};
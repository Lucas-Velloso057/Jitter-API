const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET; 

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Acesso negado. Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ error: 'Formato do Token inválido. Use: Bearer <token>' });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        
        req.user = decoded; 
        next(); 

    } catch (err) {
        return res.status(403).json({ error: 'Token inválido ou expirado.' });
    }
};
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
const secret = process.env["AUTH_SECRET"]

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    if (!authHeader) return res.status(401).json({ error: "Token não fornecido." })

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    try {
        const decoded = jwt.verify(token, secret)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({ error: "Token inválido ou expirado." })
    }
}

function isAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: "Acesso restrito a administradores." })
    }
    next()
}

export { verifyToken, isAdmin }

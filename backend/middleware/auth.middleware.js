import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()
const secret = process.env["AUTH_SECRET"]

function verifyToken(req, res, next) {
    const authHeader = req.headers['authorization']
    console.log("[DEBUG] authHeader:", authHeader)
    if (!authHeader) return res.status(401).json({ error: "Token não fornecido." })

    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader

    try {
        const decoded = jwt.verify(token, secret)
        console.log("[DEBUG] Token decoded:", decoded)
        req.user = decoded
        next()
    } catch (error) {
        console.log("[DEBUG] Token verification failed:", error.message)
        return res.status(401).json({ error: "Token inválido ou expirado." })
    }
}

function isAdmin(req, res, next) {
    console.log("[DEBUG] isAdmin check. req.user:", req.user)
    if (!req.user || req.user.role !== 'admin') {
        console.log("[DEBUG] isAdmin failed!")
        return res.status(403).json({ error: "Acesso restrito a administradores." })
    }
    console.log("[DEBUG] isAdmin success!")
    next()
}

export { verifyToken, isAdmin }

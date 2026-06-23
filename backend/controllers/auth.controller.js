import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import dotenv from "dotenv"

dotenv.config()
const secret = process.env["AUTH_SECRET"]

// ===== REGISTRO =====
async function register(request, response) {
    try {
        if (!request.body.password || !request.body.email) {
            return response.status(400).json({ error: "Informe e-mail e senha!" })
        }

        let user = await User.findOne({ where: { email: request.body.email } })
        if (user) {
            return response.status(400).json({ error: "Usuário já cadastrado!" })
        }

        const salt = bcrypt.genSaltSync()
        const hashedPassword = bcrypt.hashSync(request.body.password, salt)

        const result = await User.create({
            email: request.body.email,
            password: hashedPassword,
            name: request.body.name || null,
            role: 'user'
        })

        const meuToken = getToken(result.id, result.email, result.role)
        return response.status(201).json({
            token: meuToken,
            user: { id: result.id, email: result.email, name: result.name, role: result.role }
        })
    } catch (error) {
        console.error("Erro no registro:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== LOGIN =====
async function login(request, response) {
    try {
        if (!request.body.password || !request.body.email) {
            return response.status(400).json({ error: "Informe e-mail e senha!" })
        }

        const user = await User.findOne({ where: { email: request.body.email } })
        if (!user) {
            return response.status(401).json({ error: "E-mail ou senha incorretos." })
        }

        const senhaCorreta = bcrypt.compareSync(request.body.password, user.password)
        if (!senhaCorreta) {
            return response.status(401).json({ error: "E-mail ou senha incorretos." })
        }

        const meuToken = getToken(user.id, user.email, user.role)
        return response.status(200).json({
            token: meuToken,
            user: { id: user.id, email: user.email, name: user.name, role: user.role }
        })
    } catch (error) {
        console.error("Erro no login:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== ME =====
async function me(request, response) {
    try {
        const user = await User.findByPk(request.user.id, {
            attributes: ['id', 'email', 'name', 'role']
        })
        if (!user) return response.status(404).json({ error: "Usuário não encontrado." })
        return response.status(200).json(user)
    } catch (error) {
        console.error("Erro ao buscar usuário:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== HELPERS =====
function getToken(id, email, role) {
    return jwt.sign({ id, email, role }, secret, { expiresIn: "24h" })
}

function verifyToken(token) {
    return jwt.verify(token, secret)
}

export default { register, login, me, getToken, verifyToken }

import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"
import routes from "./routes/api.routes.js"
import dotenv from "dotenv"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Garantir que a pasta de uploads existe
const uploadsDir = path.join(__dirname, 'uploads', 'wines')
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
}

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Servir uploads como estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Rotas da API
app.use("/api", routes)

// Servir arquivos estáticos do frontend (pasta pai)
app.use(express.static(path.join(__dirname, "..")))

// Fallback: servir index.html para rotas não-API
app.get("*", (req, res) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/uploads")) {
        res.sendFile(path.join(__dirname, "..", "index.html"))
    }
})

app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════╗
║   🍽️  Estância d'Oliveira - Backend API          ║
║   Servidor rodando em http://localhost:${PORT}      ║
║   API disponível em /api                         ║
║   Uploads em /uploads                            ║
╚══════════════════════════════════════════════════╝
    `)
})

export default app

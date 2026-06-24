import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"
import routes from "./routes/api.routes.js"
import dotenv from "dotenv"
import { ensureBucket, ensureCurriculoBucket } from "./media/minio.client.js"

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rotas da API
app.use("/api", routes)

// Servir arquivos estaticos do frontend (pasta pai)
app.use(express.static(path.join(__dirname, "..")))

// Fallback: servir index.html para rotas nao-API
app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
        res.sendFile(path.join(__dirname, "..", "index.html"))
    }
})

// Inicializar MinIO buckets e subir o servidor
Promise.all([ensureBucket(), ensureCurriculoBucket()]).then(() => {
    app.listen(PORT, () => {
        console.log(`
+==================================================+
|       Estancia d'Oliveira - Backend API           |
|   Servidor rodando em http://localhost:${PORT}       |
|   API disponivel em /api                          |
|   Imagens armazenadas no MinIO (S3)               |
|   Curriculos no bucket dedicado 'curriculos'      |
+==================================================+
        `)
    })
})

export default app

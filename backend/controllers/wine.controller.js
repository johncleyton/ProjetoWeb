import Wine from "../models/wine.model.js"
import { uploadToMinio, deleteFromMinio } from "../media/minio.client.js"

// ===== LISTAR TODOS =====
async function getAll(request, response) {
    try {
        const wines = await Wine.findAll({ order: [['id', 'ASC']] })
        return response.status(200).json(wines)
    } catch (error) {
        console.error("Erro ao listar vinhos:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== CRIAR (ADMIN) — com upload de imagem via MinIO =====
async function create(request, response) {
    try {
        const { name, region, type, price, desc } = request.body

        if (!name || !region || !type || !price || !desc) {
            return response.status(400).json({ error: "Todos os campos sao obrigatorios." })
        }

        // Fallback: imagem padrao por tipo caso nenhuma imagem seja enviada
        const imageMap = {
            'tinto': 'images/wines/cabernet.png',
            'branco': 'images/wines/chardonnay.png',
            'rose': 'images/wines/rose.png',
            'espumante': 'images/wines/espumante.png',
            'porto': 'images/wines/porto.png'
        }

        let imgPath
        if (request.file) {
            // Multer segurou o arquivo na memoria — envia para o MinIO
            imgPath = await uploadToMinio(request.file.buffer, request.file.originalname, request.file.mimetype)
        } else {
            imgPath = imageMap[type] || imageMap['tinto']
        }

        const wine = await Wine.create({
            name,
            region,
            type,
            price: parseFloat(price),
            desc,
            img: imgPath
        })

        return response.status(201).json(wine)
    } catch (error) {
        console.error("Erro ao criar vinho:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== ATUALIZAR (ADMIN) =====
async function update(request, response) {
    try {
        const { id } = request.params
        const wine = await Wine.findByPk(id)
        if (!wine) return response.status(404).json({ error: "Vinho nao encontrado." })

        // Se enviou nova imagem, faz upload para o MinIO e remove a antiga
        if (request.file) {
            // Remove a imagem antiga do MinIO (se existir)
            if (wine.img && wine.img.includes('minio') || wine.img && wine.img.includes(':9000')) {
                await deleteFromMinio(wine.img)
            }
            request.body.img = await uploadToMinio(request.file.buffer, request.file.originalname, request.file.mimetype)
        }

        await wine.update(request.body)
        return response.status(200).json(wine)
    } catch (error) {
        console.error("Erro ao atualizar vinho:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== DELETAR (ADMIN) =====
async function remove(request, response) {
    try {
        const { id } = request.params
        const wine = await Wine.findByPk(id)
        if (!wine) return response.status(404).json({ error: "Vinho nao encontrado." })

        // Remove a imagem do MinIO antes de apagar o registro
        if (wine.img && (wine.img.includes('minio') || wine.img.includes(':9000'))) {
            await deleteFromMinio(wine.img)
        }

        await wine.destroy()
        return response.status(200).json({ message: "Vinho removido com sucesso!" })
    } catch (error) {
        console.error("Erro ao deletar vinho:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

export default { getAll, create, update, remove }

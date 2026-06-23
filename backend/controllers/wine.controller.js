import Wine from "../models/wine.model.js"

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

// ===== CRIAR (ADMIN) — com upload de imagem =====
async function create(request, response) {
    try {
        const { name, region, type, price, desc } = request.body

        if (!name || !region || !type || !price || !desc) {
            return response.status(400).json({ error: "Todos os campos são obrigatórios." })
        }

        // Imagem: se enviou arquivo via multer, usa o path; senão usa fallback por tipo
        const imageMap = {
            'tinto': 'images/wines/cabernet.png',
            'branco': 'images/wines/chardonnay.png',
            'rose': 'images/wines/rose.png',
            'espumante': 'images/wines/espumante.png',
            'porto': 'images/wines/porto.png'
        }

        let imgPath
        if (request.file) {
            // Multer salvou o arquivo — retorna caminho relativo para o frontend
            imgPath = 'uploads/wines/' + request.file.filename
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
        if (!wine) return response.status(404).json({ error: "Vinho não encontrado." })

        // Se enviou nova imagem, atualiza
        if (request.file) {
            request.body.img = 'uploads/wines/' + request.file.filename
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
        if (!wine) return response.status(404).json({ error: "Vinho não encontrado." })

        await wine.destroy()
        return response.status(200).json({ message: "Vinho removido com sucesso!" })
    } catch (error) {
        console.error("Erro ao deletar vinho:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

export default { getAll, create, update, remove }

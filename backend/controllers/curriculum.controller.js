import Curriculum from "../models/curriculum.model.js"
import User from "../models/user.model.js"
import { uploadCurriculo, deleteCurriculo, getCurriculoPresignedUrl } from "../media/minio.client.js"

// ===== ENVIAR CURRICULO (usuario logado) =====
async function submit(request, response) {
    try {
        const userId = request.user.id // Set by verifyToken middleware
        const { cargo, experiencia } = request.body

        if (!cargo) {
            return response.status(400).json({ error: "O campo cargo eh obrigatorio." })
        }

        let arquivoUrl = null
        if (request.file) {
            arquivoUrl = await uploadCurriculo(request.file.buffer, request.file.originalname, request.file.mimetype)
        } else {
            return response.status(400).json({ error: "O arquivo de curriculo eh obrigatorio." })
        }

        const curriculo = await Curriculum.create({
            userId,
            cargo,
            experiencia,
            arquivo: arquivoUrl
        })

        return response.status(201).json({ message: "Curriculo enviado com sucesso!", curriculo })
    } catch (error) {
        console.error("Erro ao enviar curriculo:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== LISTAR CURRICULOS (admin) =====
async function getAll(request, response) {
    try {
        const curriculos = await Curriculum.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'name', 'email']
            }],
            order: [['createdAt', 'DESC']]
        })

        // Gerar URLs presigned para download seguro
        const result = await Promise.all(curriculos.map(async (c) => {
            const plain = c.toJSON()
            if (plain.arquivo) {
                plain.downloadUrl = await getCurriculoPresignedUrl(plain.arquivo)
            }
            return plain
        }))

        return response.status(200).json(result)
    } catch (error) {
        console.error("Erro ao listar curriculos:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

// ===== DELETAR CURRICULO (admin) =====
async function remove(request, response) {
    try {
        const { id } = request.params
        const curriculo = await Curriculum.findByPk(id)
        if (!curriculo) return response.status(404).json({ error: "Curriculo nao encontrado." })

        // Remove o arquivo do MinIO
        if (curriculo.arquivo) {
            await deleteCurriculo(curriculo.arquivo)
        }

        await curriculo.destroy()
        return response.status(200).json({ message: "Curriculo removido com sucesso!" })
    } catch (error) {
        console.error("Erro ao deletar curriculo:", error)
        return response.status(500).json({ error: "Erro interno no servidor." })
    }
}

export default { submit, getAll, remove }

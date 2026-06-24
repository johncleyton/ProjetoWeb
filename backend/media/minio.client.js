import { Client } from 'minio'
import dotenv from 'dotenv'

dotenv.config()

const minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
})

const BUCKET = process.env.MINIO_BUCKET || 'wines'
const CURRICULO_BUCKET = process.env.MINIO_CURRICULO_BUCKET || 'curriculos'

// Garante que o bucket exista ao iniciar o servidor
async function ensureBucket() {
    try {
        const exists = await minioClient.bucketExists(BUCKET)
        if (!exists) {
            await minioClient.makeBucket(BUCKET)

            // Política pública para que o navegador consiga acessar as imagens
            const policy = {
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: { AWS: ["*"] },
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${BUCKET}/*`]
                }]
            }
            await minioClient.setBucketPolicy(BUCKET, JSON.stringify(policy))
            console.log(`Bucket '${BUCKET}' criado com acesso publico de leitura.`)
        } else {
            console.log(`Bucket '${BUCKET}' ja existe.`)
        }
    } catch (error) {
        console.error("Erro ao conectar ao MinIO:", error.message)
        console.error("Verifique se o MinIO esta rodando (docker ou local).")
    }
}

// Garante que o bucket de curriculos exista
async function ensureCurriculoBucket() {
    try {
        const exists = await minioClient.bucketExists(CURRICULO_BUCKET)
        if (!exists) {
            await minioClient.makeBucket(CURRICULO_BUCKET)
            console.log(`Bucket '${CURRICULO_BUCKET}' criado (acesso restrito).`)
        } else {
            console.log(`Bucket '${CURRICULO_BUCKET}' ja existe.`)
        }
    } catch (error) {
        console.error("Erro ao criar bucket de curriculos:", error.message)
    }
}

// Envia um arquivo (buffer) para o MinIO e retorna a URL publica
async function uploadToMinio(fileBuffer, originalName, mimetype) {
    const fileName = Date.now() + '-' + originalName.replace(/\s+/g, '_')

    await minioClient.putObject(BUCKET, fileName, fileBuffer, {
        'Content-Type': mimetype
    })

    // Monta a URL publica para acesso direto
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
    const port = process.env.MINIO_PORT || 9000
    return `http://${endpoint}:${port}/${BUCKET}/${fileName}`
}

// Envia um curriculo (PDF) para o bucket dedicado
async function uploadCurriculo(fileBuffer, originalName, mimetype) {
    const fileName = Date.now() + '-' + originalName.replace(/\s+/g, '_')

    await minioClient.putObject(CURRICULO_BUCKET, fileName, fileBuffer, {
        'Content-Type': mimetype
    })

    const endpoint = process.env.MINIO_ENDPOINT || 'localhost'
    const port = process.env.MINIO_PORT || 9000
    return `http://${endpoint}:${port}/${CURRICULO_BUCKET}/${fileName}`
}

// Remove um arquivo do MinIO pelo nome
async function deleteFromMinio(imageUrl) {
    try {
        // Extrai o nome do arquivo da URL completa
        const parts = imageUrl.split('/')
        const fileName = parts[parts.length - 1]

        if (fileName && imageUrl.includes(BUCKET)) {
            await minioClient.removeObject(BUCKET, fileName)
        }
    } catch (error) {
        console.error("Erro ao remover imagem do MinIO:", error.message)
    }
}

// Remove um curriculo do bucket dedicado
async function deleteCurriculo(fileUrl) {
    try {
        const parts = fileUrl.split('/')
        const fileName = parts[parts.length - 1]

        if (fileName && fileUrl.includes(CURRICULO_BUCKET)) {
            await minioClient.removeObject(CURRICULO_BUCKET, fileName)
        }
    } catch (error) {
        console.error("Erro ao remover curriculo do MinIO:", error.message)
    }
}

// Gera uma URL temporaria (presigned) para download seguro de curriculos
async function getCurriculoPresignedUrl(fileUrl) {
    try {
        const parts = fileUrl.split('/')
        const fileName = parts[parts.length - 1]
        // URL valida por 1 hora
        return await minioClient.presignedGetObject(CURRICULO_BUCKET, fileName, 3600)
    } catch (error) {
        console.error("Erro ao gerar URL presigned:", error.message)
        return null
    }
}

export {
    minioClient, BUCKET, CURRICULO_BUCKET,
    ensureBucket, ensureCurriculoBucket,
    uploadToMinio, uploadCurriculo,
    deleteFromMinio, deleteCurriculo,
    getCurriculoPresignedUrl
}


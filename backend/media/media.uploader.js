import multer from 'multer'

// Armazena o arquivo na memoria (buffer) em vez de salvar em disco.
// O buffer sera enviado para o MinIO pelo controller.
const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.mimetype)) {
        cb(null, true)
    } else {
        cb(new Error('Apenas imagens (JPG, PNG, WebP) e PDFs sao permitidos'), false)
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter
})

export default upload

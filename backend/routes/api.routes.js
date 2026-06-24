import express from "express"
import authController from "../controllers/auth.controller.js"
import wineController from "../controllers/wine.controller.js"
import orderController from "../controllers/order.controller.js"
import { verifyToken, isAdmin } from "../middleware/auth.middleware.js"
import upload from "../media/media.uploader.js"
import curriculumController from "../controllers/curriculum.controller.js"

const router = express.Router()

// ===== AUTH =====
router.post("/auth/register", authController.register)
router.post("/auth/login", authController.login)
router.get("/auth/me", verifyToken, authController.me)

// ===== VINHOS (público) =====
router.get("/wines", wineController.getAll)

// ===== VINHOS (admin + upload de imagem) =====
router.post("/wines", verifyToken, isAdmin, upload.single('img'), wineController.create)
router.put("/wines/:id", verifyToken, isAdmin, upload.single('img'), wineController.update)
router.delete("/wines/:id", verifyToken, isAdmin, wineController.remove)

// ===== PEDIDOS =====
router.post("/orders/marmita", orderController.createMarmitaOrder)
router.post("/orders/wine", orderController.createWineOrder)

// ===== CURRICULOS =====
router.post("/curriculum", verifyToken, upload.single('curriculo'), curriculumController.submit)
router.get("/curriculum", verifyToken, isAdmin, curriculumController.getAll)
router.delete("/curriculum/:id", verifyToken, isAdmin, curriculumController.remove)

export default router

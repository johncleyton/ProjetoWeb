import User from "./models/user.model.js"
import Wine from "./models/wine.model.js"
import Curriculum from "./models/curriculum.model.js"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

console.log("Sincronizando banco de dados...")

await User.sync({ alter: true })
console.log("Tabela 'users' sincronizada.")

await Wine.sync({ alter: true })
console.log("Tabela 'wines' sincronizada.")

await Curriculum.sync({ alter: true })
console.log("Tabela 'curriculums' sincronizada.")

// ===== SEED: Admin padrão =====
const adminEmail = process.env.ADMIN_EMAIL || "admin@estancia.com"
const adminPassword = process.env.ADMIN_PASSWORD || "admin123"

const adminExists = await User.findOne({ where: { email: adminEmail } })
if (!adminExists) {
    const salt = bcrypt.genSaltSync()
    const hashedPassword = bcrypt.hashSync(adminPassword, salt)
    await User.create({
        email: adminEmail,
        password: hashedPassword,
        name: "Administrador",
        role: "admin"
    })
    console.log(`Admin padrão criado: ${adminEmail}`)
} else {
    // Força o cargo para admin caso tenha sido sobrescrito no passado
    if (adminExists.role !== 'admin') {
        adminExists.role = 'admin'
        await adminExists.save()
        console.log(`Cargo do admin corrigido para 'admin': ${adminEmail}`)
    } else {
        console.log(`Admin já existe e está correto: ${adminEmail}`)
    }
}



console.log("\nSincronização concluída com sucesso!")
process.exit(0)

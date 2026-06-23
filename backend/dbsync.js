import User from "./models/user.model.js"
import Wine from "./models/wine.model.js"
import bcrypt from "bcryptjs"
import dotenv from "dotenv"

dotenv.config()

console.log("🔄 Sincronizando banco de dados...")

await User.sync({ alter: true })
console.log("✅ Tabela 'users' sincronizada.")

await Wine.sync({ alter: true })
console.log("✅ Tabela 'wines' sincronizada.")

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
    console.log(`✅ Admin padrão criado: ${adminEmail}`)
} else {
    console.log(`ℹ️  Admin já existe: ${adminEmail}`)
}

// ===== SEED: Vinhos padrão =====
const wineCount = await Wine.count()
if (wineCount === 0) {
    const defaultWines = [
        { name: "Quinta do Douro Reserva", region: "Douro, Portugal", type: "tinto", price: 189.90, desc: "Tinto encorpado com notas de frutas vermelhas maduras, especiarias e um toque de carvalho. Ideal para carnes grelhadas.", img: "images/wines/douro-red.png" },
        { name: "Malbec Gran Reserva", region: "Mendoza, Argentina", type: "tinto", price: 159.90, desc: "Intenso e aveludado, com aromas de ameixa, chocolate amargo e um final longo e elegante.", img: "images/wines/malbec.png" },
        { name: "Cabernet Sauvignon Premium", region: "Vale Central, Chile", type: "tinto", price: 129.90, desc: "Clássico chileno com taninos firmes, notas de cassis e pimentão verde. Perfeito com massas ao molho vermelho.", img: "images/wines/cabernet.png" },
        { name: "Chardonnay Grand Cru", region: "Borgonha, França", type: "branco", price: 219.90, desc: "Elegante e mineral, com notas de frutas cítricas, manteiga e um toque floral. Harmoniza com peixes e frutos do mar.", img: "images/wines/chardonnay.png" },
        { name: "Rosé de Provence", region: "Provence, França", type: "rose", price: 149.90, desc: "Delicado e refrescante com tons de morango, pêssego e ervas finas. Ideal para tardes ensolaradas.", img: "images/wines/rose.png" },
        { name: "Porto Vintage Tawny 10 Anos", region: "Porto, Portugal", type: "porto", price: 249.90, desc: "Vinho do Porto envelhecido com notas de caramelo, nozes e frutas secas. Perfeito como sobremesa.", img: "images/wines/porto.png" },
        { name: "Sauvignon Blanc Reserva", region: "Marlborough, Nova Zelândia", type: "branco", price: 139.90, desc: "Fresco e vibrante com aromas de maracujá, limão e notas herbáceas. Excelente com saladas.", img: "images/wines/sauvignon.png" },
        { name: "Espumante Brut Charmat", region: "Serra Gaúcha, Brasil", type: "espumante", price: 89.90, desc: "Espumante brasileiro com perlage fina, notas de maçã verde e torrada. Perfeito para celebrar.", img: "images/wines/espumante.png" }
    ]

    await Wine.bulkCreate(defaultWines)
    console.log(`✅ ${defaultWines.length} vinhos padrão inseridos.`)
} else {
    console.log(`ℹ️  Já existem ${wineCount} vinhos no banco.`)
}

console.log("\n🎉 Sincronização concluída com sucesso!")
process.exit(0)

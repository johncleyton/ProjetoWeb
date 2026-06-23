import { Sequelize } from "sequelize"
import dotenv from "dotenv"

dotenv.config()

const PGHOST = process.env['PGHOST']
const PGUSER = process.env['PGUSER']
const PGDATABASE = process.env['PGDATABASE']
const PGPASSWORD = process.env['PGPASSWORD']
const PGPORT = process.env['PGPORT'] || 5432

const sequelize = new Sequelize(PGDATABASE, PGUSER, PGPASSWORD, {
    host: PGHOST,
    port: PGPORT,
    dialect: 'postgres',
    logging: false
})

export default sequelize

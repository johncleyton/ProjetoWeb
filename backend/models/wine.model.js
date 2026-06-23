import { Model, DataTypes } from "sequelize"
import sequelize from "./dbconfig.js"

class Wine extends Model {}

Wine.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        region: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        type: {
            type: DataTypes.ENUM('tinto', 'branco', 'rose', 'espumante', 'porto'),
            allowNull: false,
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
        },
        desc: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        img: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: 'images/wines/cabernet.png',
        }
    },
    {
        sequelize,
        modelName: "Wine",
        tableName: "wines",
        timestamps: true,
    }
)

export default Wine

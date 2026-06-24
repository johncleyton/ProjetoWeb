import { Model, DataTypes } from "sequelize"
import sequelize from "./dbconfig.js"
import User from "./user.model.js"

class Curriculum extends Model {}

Curriculum.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: User,
                key: 'id'
            }
        },
        cargo: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        experiencia: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        arquivo: {
            type: DataTypes.STRING, // URL in MinIO
            allowNull: true,
        }
    },
    {
        sequelize,
        modelName: "Curriculum",
        tableName: "curriculums",
        timestamps: true,
    }
)

// Relationships
User.hasMany(Curriculum, { foreignKey: 'userId', as: 'curriculums' })
Curriculum.belongsTo(User, { foreignKey: 'userId', as: 'user' })

export default Curriculum

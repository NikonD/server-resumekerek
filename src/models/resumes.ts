import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface resumesAttributes {
  id: number;
  user_id: number;
  resume: object;
}

export type resumesPk = "id";
export type resumesId = resumes[resumesPk];
export type resumesOptionalAttributes = "id";
export type resumesCreationAttributes = Optional<resumesAttributes, resumesOptionalAttributes>;

export class resumes extends Model<resumesAttributes, resumesCreationAttributes> implements resumesAttributes {
  id!: number;
  user_id!: number;
  resume!: object;


  static initModel(sequelize: Sequelize.Sequelize): typeof resumes {
    return resumes.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    resume: {
      type: DataTypes.JSON,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'resumes',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "resumes_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

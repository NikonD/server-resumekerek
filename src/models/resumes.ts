import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface resumesAttributes {
  id: number;
  user_id: number;
  resume: object;
  filename: string;
  template?: string;
  date_create: Date;
  preview?: string;
  settings?: object;
}

export type resumesPk = "id";
export type resumesId = resumes[resumesPk];
export type resumesOptionalAttributes = "id" | "template" | "date_create" | "preview" | "settings";
export type resumesCreationAttributes = Optional<resumesAttributes, resumesOptionalAttributes>;

export class resumes extends Model<resumesAttributes, resumesCreationAttributes> implements resumesAttributes {
  id!: number;
  user_id!: number;
  resume!: object;
  filename!: string;
  template?: string;
  date_create!: Date;
  preview?: string;
  settings?: object;


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
    },
    filename: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    template: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date_create: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('now')
    },
    preview: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true
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

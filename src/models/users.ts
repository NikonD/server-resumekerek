import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface usersAttributes {
  id: number;
  fullname: string;
  verify: boolean;
  verify_at?: Date;
  password: string;
  email: string;
  plan?: number;
  active_until?: Date;
  profile_data?: object;
}

export type usersPk = "id";
export type usersId = users[usersPk];
export type usersOptionalAttributes = "id" | "verify_at" | "plan" | "active_until" | "profile_data";
export type usersCreationAttributes = Optional<usersAttributes, usersOptionalAttributes>;

export class users extends Model<usersAttributes, usersCreationAttributes> implements usersAttributes {
  id!: number;
  fullname!: string;
  verify!: boolean;
  verify_at?: Date;
  password!: string;
  email!: string;
  plan?: number;
  active_until?: Date;
  profile_data?: object;


  static initModel(sequelize: Sequelize.Sequelize): typeof users {
    return users.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fullname: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    verify: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    verify_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    plan: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    active_until: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_data: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'users',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "users_email_uindex",
        unique: true,
        fields: [
          { name: "email" },
        ]
      },
      {
        name: "users_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

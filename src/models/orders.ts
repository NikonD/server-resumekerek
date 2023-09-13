import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';
import type { users, usersId } from './users';

export interface ordersAttributes {
  id: string;
  pg_order_id: string;
  pg_amount: number;
  pg_currency: string;
  pg_description: string;
  pg_contact_email: number;
  pg_result: number;
  user_id: number;
  pg_payment_id?: string;
}

export type ordersPk = "id";
export type ordersId = orders[ordersPk];
export type ordersOptionalAttributes = "id" | "pg_contact_email" | "pg_payment_id";
export type ordersCreationAttributes = Optional<ordersAttributes, ordersOptionalAttributes>;

export class orders extends Model<ordersAttributes, ordersCreationAttributes> implements ordersAttributes {
  id!: string;
  pg_order_id!: string;
  pg_amount!: number;
  pg_currency!: string;
  pg_description!: string;
  pg_contact_email!: number;
  pg_result!: number;
  user_id!: number;
  pg_payment_id?: string;

  // orders belongsTo users via user_id
  user!: users;
  getUser!: Sequelize.BelongsToGetAssociationMixin<users>;
  setUser!: Sequelize.BelongsToSetAssociationMixin<users, usersId>;
  createUser!: Sequelize.BelongsToCreateAssociationMixin<users>;

  static initModel(sequelize: Sequelize.Sequelize): typeof orders {
    return orders.init({
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    pg_order_id: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pg_amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pg_currency: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pg_description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    pg_contact_email: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false
    },
    pg_result: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    pg_payment_id: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'orders',
    schema: 'public',
    timestamps: false,
    indexes: [
      {
        name: "orders_pk",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  }
}

import type { Sequelize } from "sequelize";
import { orders as _orders } from "./orders";
import type { ordersAttributes, ordersCreationAttributes } from "./orders";
import { resumes as _resumes } from "./resumes";
import type { resumesAttributes, resumesCreationAttributes } from "./resumes";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";

export {
  _orders as orders,
  _resumes as resumes,
  _users as users,
};

export type {
  ordersAttributes,
  ordersCreationAttributes,
  resumesAttributes,
  resumesCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const orders = _orders.initModel(sequelize);
  const resumes = _resumes.initModel(sequelize);
  const users = _users.initModel(sequelize);

  orders.belongsTo(users, { as: "user", foreignKey: "user_id"});
  users.hasMany(orders, { as: "orders", foreignKey: "user_id"});

  return {
    orders: orders,
    resumes: resumes,
    users: users,
  };
}

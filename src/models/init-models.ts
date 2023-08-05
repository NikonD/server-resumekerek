import type { Sequelize } from "sequelize";
import { resumes as _resumes } from "./resumes";
import type { resumesAttributes, resumesCreationAttributes } from "./resumes";
import { users as _users } from "./users";
import type { usersAttributes, usersCreationAttributes } from "./users";

export {
  _resumes as resumes,
  _users as users,
};

export type {
  resumesAttributes,
  resumesCreationAttributes,
  usersAttributes,
  usersCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const resumes = _resumes.initModel(sequelize);
  const users = _users.initModel(sequelize);


  return {
    resumes: resumes,
    users: users,
  };
}

import * as config from "../config/db_config.json"
import { Sequelize } from "sequelize";
import { initModels as publicInitModels } from "./init-models";


// @ts-ignore
const sequelize = new Sequelize({
    dialect: config.dialect,
    host: config.host,
    username: config.username,
    password: config.password,
    database: config.database,
    logging: config.logging,
});

const models = publicInitModels(sequelize);



export {Sequelize, sequelize, models};
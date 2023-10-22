import fs from "fs";
import Sequelize from "sequelize";
import {
  username,
  password,
  host,
  port,
  database,
  path,
} from "./constants.js";

const ca = fs.readFileSync(path).toString();

let sequelizeOptions = {
  dialect: "mysql",
  username,
  password,
  host,
  port,
  database,
  dialectOptions: {
    ssl: {
      ca,
    },
  },
  logging: false,
};

const sequelize = new Sequelize(sequelizeOptions);
export default sequelize;

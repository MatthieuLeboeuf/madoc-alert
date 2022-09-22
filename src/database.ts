import mariadb from "mariadb";
import { config } from "./config.js";

export const Database = mariadb.createPool({
  host: config.database.host,
  port: config.database.port,
  user: config.database.username,
  password: config.database.password,
  database: config.database.database,
});

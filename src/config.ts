import { readFileSync } from "fs";
import { parse } from "yaml";

export const config = parse(readFileSync("./config.yaml", "utf8"));

import { dirname, importx } from "@discordx/importer";
import { Interaction } from "discord.js";
import { Client } from "discordx";
import { config } from "./config.js";
import { Database } from "./database.js";
import processMadoc from "./madoc-cron.js";
import cron from "node-cron";

export const bot = new Client({
  intents: [],
  silent: !config.dev,
});

bot.once("ready", async () => {
  await bot.initApplicationCommands();

  Database.getConnection()
    .then((conn) => {
      console.log("Database has been initialized!");
      conn.end();
    })
    .catch((err: any) => {
      console.error("Error during Database initialization", err);
    });

  cron.schedule("0 20 * * *", async () => {
    await processMadoc(bot);
  });

  console.log(`Logged in as ${bot.user?.tag}`);
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

async function run() {
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);
  await bot.login(config.bot.token);
}

run();

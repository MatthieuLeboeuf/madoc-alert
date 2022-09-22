import { dirname, importx } from "@discordx/importer";
import { EmbedBuilder, Interaction } from "discord.js";
import { Client } from "discordx";
import { config } from "./config.js";
import { Database } from "./database.js";
import cron from "node-cron";
import ical from "ical";
import axios from "axios";
import moment from "moment";

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const bot = new Client({
  // Discord intents
  intents: [],

  // Debug logs are disabled in silent mode
  silent: !config.dev,
});

bot.once("ready", async () => {
  // Synchronize applications commands with Discord
  await bot.initApplicationCommands();

  Database.getConnection()
    .then((conn) => {
      console.log("Database has been initialized!");
      conn.end();
    })
    .catch((err: any) => {
      console.error("Error during Database initialization", err);
    });

  // check
  moment.locale("fr");
  cron.schedule("0 20 * * *", async () => {
    const messages = await Database.query("SELECT * FROM user").catch((err) =>
      console.error(err)
    );
    let f = 0;
    while (true) {
      if (typeof messages[f] !== "object") break;
      const res = await axios({
        url: messages[f].link,
        method: "GET",
      });
      const data = ical.parseICS(res.data);
      let msg = "";
      for (let k in data) {
        if (data.hasOwnProperty(k)) {
          const ev = data[k];
          if (ev.type == "VEVENT") {
            if (!ev.end) continue;
            if (ev.end?.getTime() / 1000 > Date.now() / 1000 + 3600 * 72)
              continue;
            msg += `${msg === "" ? "" : "\n"}- (${ev.categories?.join(
              ", "
            )}) **${ev.summary
              ?.replace("se termine", "")
              .replace("doit être effectué", "")}** `;
            msg += `${ev.description?.replaceAll(
              "\n",
              ""
            )} à terminer pour le ${moment(new Date(ev.end?.getTime())).format(
              "llll"
            )}`;
          }
        }
      }
      const embed = new EmbedBuilder()
        .setTitle("Récapitulatif des evenements à venir (72h)")
        .setDescription(msg)
        .setColor("#ff9f43")
        .setTimestamp();
      bot.users.fetch(messages[f].user_id).then(async (user) => {
        await user.send({
          embeds: [embed],
        });
      });
      f += 1;
    }
  });

  //  await bot.clearApplicationCommands(
  //    ...bot.guilds.cache.map((g) => g.id)
  //  );

  console.log(`Logged in as ${bot.user?.tag}`);
});

bot.on("interactionCreate", (interaction: Interaction) => {
  bot.executeInteraction(interaction);
});

async function run() {
  // The following syntax should be used in the ECMAScript environment
  await importx(`${dirname(import.meta.url)}/{events,commands}/**/*.{ts,js}`);

  // Log in with your bot token
  await bot.login(config.bot.token);
}

run();

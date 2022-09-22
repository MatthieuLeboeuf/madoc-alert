import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash } from "discordx";
import axios from "axios";
import { Database } from "../database.js";
import moment from "moment";
import ical from "ical";

@Discord()
export class EnableNotification {
  @Slash({
    description: "Lancer la cron madoc manuellement",
    name: "process",
    defaultMemberPermissions: 0n,
    dmPermission: false,
  })
  async process(interaction: CommandInteraction) {
    await interaction.deferReply();
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
      interaction.client.users.fetch(messages[f].user_id).then(async (user) => {
        await user.send({
          embeds: [embed],
        });
      });
      f += 1;
    }
    interaction.editReply({
      content: "Cron terminée",
    });
  }
}

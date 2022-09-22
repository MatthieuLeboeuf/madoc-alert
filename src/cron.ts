import ical from "ical";
import axios from "axios";
import moment from "moment";
import { Database } from "./database.js";
import { EmbedBuilder } from "discord.js";

export default async (client: any) => {
  moment.locale("fr");
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
          if (ev.end?.getTime() > Date.now() + 3600 * 72 * 1000) continue;
          if (ev.end?.getTime() < Date.now()) continue;
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
      .setDescription(
        msg === ""
          ? "Il y a aucuns événements dans les 3 prochains jours !"
          : msg
      )
      .setColor(msg === "" ? "#10ac84" : "#ff9f43")
      .setTimestamp();
    client.users.fetch(messages[f].user_id).then(async (user: any) => {
      await user.send({
        embeds: [embed],
      });
    });
    f += 1;
  }
};

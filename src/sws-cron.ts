import axios from "axios";
import moment from "moment";
import { Database } from "./database.js";
import { EmbedBuilder } from "discord.js";

export default async (client: any) => {
  moment.locale("fr");
  const messages = await Database.query("SELECT * FROM sws").catch((err) =>
    console.error(err)
  );
  let f = 0;
  while (true) {
    if (typeof messages[f] !== "object") break;
    const auth = btoa(
      messages[f].institution_code +
        messages[f].identifier_code +
        messages[f].pin_code
    );
    const res = await axios({
      url: "https://app.sowesign.com/api/portal/authentication/token",
      method: "POST",
      headers: {
        Authorization: "JBAuth " + auth,
      },
    });
    const d = new Date();
    const res2 = await axios({
      url: `https://app.sowesign.com/api/student-portal/courses?from=${d.getFullYear()}-${
        d.getMonth() - 1
      }-${d.getDate()}&to=${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`,
      method: "GET",
      headers: {
        Authorization: "Bearer " + res.data.token,
      },
    });

    for (let i = 0; i < res2.data.length; i++) {
      if (res2.data[i].signature.status !== "present-token") continue;
      const res3 = await axios({
        url: "https://app.sowesign.com/api/student-portal/signatures",
        method: "POST",
        headers: {
          Authorization: "Bearer " + res.data.token,
        },
        data: {
          campus: null,
          collectedOn: d.toISOString(),
          collectMode: "studentPortal",
          course: res2.data[i].id,
          file: "",
          md5: "",
          place: null,
          recovery: true,
          recoveryRole: "Student",
          signedOn: d.toISOString(),
          signer: 1,
          status: "present",
        },
      });
    }

    let msg = "";
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

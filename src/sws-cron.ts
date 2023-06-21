import axios from "axios";
import moment from "moment";
import momentTimezone from "moment-timezone";
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
    let t = res.data.token;
    t = t.split(".")[1];
    t = t.replace("-", "+").replace("_", "/");
    t = JSON.parse(
      decodeURIComponent(
        Array.prototype.map
          .call(
            atob(t),
            (e) => "%" + ("00" + e.charCodeAt(0).toString(16)).slice(-2)
          )
          .join("")
      )
    );

    const res2 = await axios({
      url:
        "https://app.sowesign.com/api/student-portal/students/" +
        t.entity.id +
        "/presenttokens?limit=50",
      method: "GET",
      headers: {
        Authorization: "Bearer " + res.data.token,
      },
    });

    const signed = [];

    const d = momentTimezone().tz("Europe/Paris").format();
    for (let i = 0; i < res2.data.length; i++) {
      const c = new Date(res2.data[i].signature.collectedOn);
      await axios({
        url: "https://app.sowesign.com/api/student-portal/signatures",
        method: "POST",
        headers: {
          Authorization: "Bearer " + res.data.token,
        },
        data: {
          campus: null,
          collectedOn: d.toString(),
          collectMode: "studentPortal",
          course: res2.data[i].id,
          file: messages[f].signature,
          md5: messages[f].md5,
          place: null,
          recovery: true,
          recoveryBy: `${t.entity.lastName} ${t.entity.firstName}`,
          recoveryReason: `Jeton de présence posé par le formateur le ${moment(
            c
          ).format("DD/MM/YYYY")} à ${moment(c).format("HH:mm:ss")}`,
          recoveryRole: "Student",
          signedOn: d.toString(),
          signer: t.entity.id,
          status: "present",
        },
      });
      signed.push(res2.data[i].name);
    }

    if (signed.length !== 0) {
      const embed = new EmbedBuilder()
        .setTitle("Signatures SoWeSign")
        .setDescription(
          `J'ai fait ${signed.length} signatures : \n${signed.join("\n")}`
        )
        .setColor("#10ac84")
        .setTimestamp();
      client.users.fetch(messages[f].user_id).then(async (user: any) => {
        await user.send({
          embeds: [embed],
        });
      });
    }
    f += 1;
  }
};

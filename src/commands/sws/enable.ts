import { ApplicationCommandOptionType, CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import axios from "axios";
import md5 from "md5";
import { Database } from "../../database.js";

@Discord()
@SlashGroup({ description: "SoWeSign", name: "sws" })
@SlashGroup("sws")
export class EnableNotification {
  @Slash({
    description: "Activation des signatures automatiques SoWeSign",
    name: "enable",
  })
  async enable(
    @SlashOption({
      name: "institution_code",
      description: "Code de l'établissement",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    institution_code: string,
    @SlashOption({
      name: "identifier_code",
      description: "Code d'identification",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    identifier_code: string,
    @SlashOption({
      name: "pin_code",
      description: "Code personnel",
      type: ApplicationCommandOptionType.String,
      required: true,
    })
    pin_code: string,
    interaction: CommandInteraction
  ) {
    await interaction.deferReply({ ephemeral: true });

    const auth = btoa(institution_code + identifier_code + pin_code);

    const res = await axios({
      url: "https://app.sowesign.com/api/portal/authentication/token",
      method: "POST",
      headers: {
        Authorization: "JBAuth " + auth,
      },
    });

    if (res.status !== 200) {
      return interaction.editReply({
        content: "Une erreur s'est produite !",
      });
    }

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

    if (res2.status !== 200) {
      return interaction.editReply({
        content: "Une erreur s'est produite !",
      });
    }

    if (res2.data.length === 0) {
      return interaction.editReply({
        content: "Je n'ai pas trouvé de signature récente sur votre compte !",
      });
    }

    let url;

    for (let i = 0; i < res2.data.length; i++) {
      if (res2.data[i].signature.status !== "present") continue;
      url = res2.data[i].signature.url;
      break;
    }

    const res3 = await axios({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
    });

    if (res3.status !== 200) {
      return interaction.editReply({
        content: "Une erreur s'est produite !",
      });
    }

    const image =
      "data:image/png;base64," +
      Buffer.from(res3.data, "binary").toString("base64");

    const check = md5(image);

    const query = await Database.query("SELECT * FROM sws WHERE user_id = ?", [
      interaction.user.id,
    ]).catch((err) => console.error(err));
    if (typeof query[0] === "object") {
      return interaction.editReply({
        content: "Les signatures ont déja été activées !",
      });
    }

    Database.query(
      "INSERT INTO sws (user_id, institution_code, identifier_code, pin_code, signature, md5) values (?, ?, ?, ?, ?, ?)",
      [
        interaction.user.id,
        institution_code,
        identifier_code,
        pin_code,
        image,
        check,
      ]
    ).catch((err) => console.error(err));

    await interaction.editReply({
      content:
        "Les signatures sont désormais activées !\nCette signature sera utilisée :\n" +
        url,
    });
  }
}

import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { Database } from "../../database.js";

@Discord()
@SlashGroup({ description: "SoWeSign", name: "sws" })
@SlashGroup("sws")
export class DisableNotification {
  @Slash({
    description: "Désactivation des signatures automatiques SoWeSign",
    name: "disable",
  })
  async disable(interaction: CommandInteraction) {
    await interaction.deferReply();

    const query = await Database.query("SELECT * FROM sws WHERE user_id = ?", [
      interaction.user.id,
    ]).catch((err) => console.error(err));
    if (typeof query[0] !== "object") {
      return interaction.editReply({
        content: "Les signatures ne sont pas activées !",
      });
    }

    Database.query("DELETE FROM sws WHERE user_id = ?", [
      interaction.user.id,
    ]).catch((err) => console.error(err));

    await interaction.editReply({
      content: "Les signatures sont désormais désactivées !",
    });
  }
}

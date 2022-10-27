import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import { Database } from "../../database.js";

@Discord()
@SlashGroup({ description: "Madoc", name: "madoc" })
@SlashGroup("madoc")
export class DisableNotification {
  @Slash({
    description: "Désactivation des notifications pour MaDoc",
    name: "disable",
  })
  async disable(interaction: CommandInteraction) {
    await interaction.deferReply();

    const query = await Database.query("SELECT * FROM user WHERE user_id = ?", [
      interaction.user.id,
    ]).catch((err) => console.error(err));
    if (typeof query[0] !== "object") {
      return interaction.editReply({
        content: "Les notifications ne sont pas activées !",
      });
    }

    Database.query("DELETE FROM user WHERE user_id = ?", [
      interaction.user.id,
    ]).catch((err) => console.error(err));

    await interaction.editReply({
      content: "Les notifications sont désormais désactivées !",
    });
  }
}

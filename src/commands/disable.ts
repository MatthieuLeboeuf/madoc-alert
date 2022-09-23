import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Database } from "../database.js";

@Discord()
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

    interaction.editReply({
      content: "Les notifications sont désormais désactivées !",
    });
  }
}

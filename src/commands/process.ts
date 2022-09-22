import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import process from "./../cron.js";

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
    await process(interaction.client);
    interaction.editReply({
      content: "Cron terminée",
    });
  }
}

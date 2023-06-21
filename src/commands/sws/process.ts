import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashGroup } from "discordx";
import process from "../../sws-cron.js";

@Discord()
@SlashGroup({ description: "SoWeSign", name: "sws" })
@SlashGroup("sws")
export class EnableNotification {
  @Slash({
    description: "Lancer la cron manuellement",
    name: "process",
    defaultMemberPermissions: 0n,
    dmPermission: false,
  })
  async process(interaction: CommandInteraction) {
    await interaction.deferReply();
    await process(interaction.client);
    await interaction.editReply({
      content: "Cron terminée",
    });
  }
}

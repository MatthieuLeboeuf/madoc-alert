import {
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { Discord, Slash, SlashGroup, SlashOption } from "discordx";
import axios from "axios";
import { Database } from "../../database.js";

@Discord()
@SlashGroup({ description: "Madoc", name: "madoc" })
@SlashGroup("madoc")
export class EnableNotification {
  @Slash({
    description: "Activation des notifications pour MaDoc",
    name: "enable",
  })
  async enable(
    @SlashOption({
      name: "link",
      description: "Lien du calendrier",
      type: ApplicationCommandOptionType.String,
      required: false,
    })
    link: string,
    interaction: CommandInteraction
  ) {
    const embed = new EmbedBuilder()
      .setTitle("Comment configurer les notifications MaDoc ?")
      .setDescription(
        "Il faut tout d'abord vous connecter sur [madoc](https://madoc.univ-nantes.fr/login/index.php?authCAS=CAS) puis vous rendre sur [ce lien](https://madoc.univ-nantes.fr/calendar/export.php) pour exporter le calendrier et récupérer le lien pour le fournir avec cette commande.\nVous pouvez vous aider de l'image ci-dessous :"
      )
      .setImage("https://s.matthieul.dev/ff6313df-190c-4097-a388-db2c07801a78");

    if (!link) {
      return interaction.reply({
        embeds: [embed],
      });
    }

    if (
      !link.startsWith(
        "https://madoc.univ-nantes.fr/calendar/export_execute.php?userid="
      )
    ) {
      return interaction.reply({
        content: "Le lien entré est invalide !",
      });
    }

    await interaction.deferReply({ ephemeral: true });

    const res = await axios({
      url: link,
      method: "GET",
    });

    if (res.status !== 200) {
      return interaction.editReply({
        content: "Une erreur s'est produite !",
      });
    }

    const query = await Database.query(
      "SELECT * FROM madoc WHERE user_id = ?",
      [interaction.user.id]
    ).catch((err) => console.error(err));
    if (typeof query[0] === "object") {
      return interaction.editReply({
        content: "Les notifications ont déja été activées !",
      });
    }

    Database.query("INSERT INTO madoc (user_id, madoc_link) values (?, ?)", [
      interaction.user.id,
      link,
    ]).catch((err) => console.error(err));

    await interaction.editReply({
      content: "Les notifications sont désormais activées !",
    });
  }
}

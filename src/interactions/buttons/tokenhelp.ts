import {
  ActionRowBuilder,
  ButtonInteraction,
  Client,
  EmbedBuilder,
  MessageFlags,
  StringSelectMenuBuilder,
} from "discord.js";

const execute = async (client: Client, interaction: ButtonInteraction) => {
  const embed = new EmbedBuilder()
    .setTitle("`❓` ▸ Aide pour le Token")
    .setDescription(
      "> Si vous avez besoin d'aide avec votre token, **veuillez utiliser le menu de sélection __ci-dessous__**."
    )
    .setColor("Red");

  const select = new StringSelectMenuBuilder()
    .setCustomId("gettoken")
    .setPlaceholder("Veuillez sélectionner une plateforme")
    .addOptions([
      {
        label: "PC",
        emoji: "🖥️",
        value: "pc",
      },
      {
        label: "Android/iOS",
        emoji: "📱",
        value: "mobile",
      }
    ]);

  const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(select);

  await interaction.reply({
    embeds: [embed],
    components: [row],
    flags: MessageFlags.Ephemeral,
  });
};

export { execute };

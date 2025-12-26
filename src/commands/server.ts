import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Client,
} from "discord.js";
import { type Client as User } from "discord.js-selfbot-v13";
import { isGuild } from "../structure/util/functions/isGuild";

const props = {
  name: "server",
  description: "Commandes liées au serveur",
  type: 1,
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "banner",
      description: "Affiche la bannière du serveur.",
      type: 1,
    },
    {
      name: "icon",
      description: "Affiche l'icône du serveur.",
      type: 1,
    },
    {
      name: "info",
      description: "Affiche les informations du serveur.",
      type: 1,
    },
  ],
};

const execute = async (
  client: Client,
  user: User,
  interaction: ChatInputCommandInteraction
) => {
  const subCommand = interaction.options.getSubcommand();

  if (!isGuild(interaction)) return;

  try {
    const guild = user.guilds.cache.get(interaction.guildId!)!;
    if (!guild) throw new Error("Guild not found");

    switch (subCommand) {
      case "bannière": {
        const bannerURL = guild.bannerURL({ size: 1024 });
        if (!bannerURL) throw new Error("No banner");

        const embed = new EmbedBuilder()
          .setImage(bannerURL)
          .setColor("#2b2d31");
        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("URL")
          .setURL(bannerURL);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
        break;
      }
      case "info": {
        const embed = new EmbedBuilder()
          .setTitle(`\`🙍\` ▸ Informations de ${guild.name}`)
          .setDescription(
            `> __\`📋\` ▸ Informations du serveur__\n` +
              `> **Nom:** \`${guild.name}\`\n` +
              `> **ID:** \`${guild.id}\`\n` +
              `> **Propriétaire:** <@${guild.ownerId}>\n` +
              `> **Membres:** \`${guild.memberCount}\`\n` +
              `> **Créé le:** <t:${Math.floor(
                guild.createdAt.getTime() / 1000
              )}:F>\n`
          )
          .setThumbnail(guild.iconURL({ size: 1024 }))
          .setColor("#2b2d31");

        const components = [];
        const iconURL = guild.iconURL({ size: 1024 });
        if (iconURL) {
          const buttonIcon = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("URL de l'icône")
            .setURL(iconURL);
          components.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttonIcon)
          );
        }

        const bannerURL = guild.bannerURL({ size: 1024 });
        if (bannerURL) {
          embed.setImage(bannerURL);
          const buttonBanner = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("URL de la bannière")
            .setURL(bannerURL);
          components.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(buttonBanner)
          );
        }

        await interaction.editReply({ embeds: [embed], components });
        break;
      }
      case "icone": {
        const iconURL = guild.iconURL({ size: 1024 });
        if (!iconURL) throw new Error("No icon");

        const embed = new EmbedBuilder().setImage(iconURL).setColor("#2b2d31");
        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("URL")
          .setURL(iconURL);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await interaction.editReply({
          embeds: [embed],
          components: [row],
        });
        break;
      }
      default:
        throw new Error("Unknown subcommand");
    }
  } catch (error) {
    await interaction.editReply({
      content: "Impossible de récupérer les informations du serveur.",
    });
  }
};

export { execute, props };

import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    type ChatInputCommandInteraction,
    type Client,
  } from "discord.js";
  import { type Client as User } from "discord.js-selfbot-v13";
  import { version } from "../../package.json";
  import db from "../structure/util/lib/database";
  
  const props = {
    name: "self",
    description: "Commandes liées à ShadowSB",
    type: 1,
    integration_types: [1],
    contexts: [0, 1, 2],
    options: [
      {
        name: "ping",
        description: "Affiche la latence de ShadowSB et Discord.",
        type: 1,
      },
      {
        name: "info",
        description: "Affiche des informations sur vous.",
        type: 1,
      },
      {
        name: "banner",
        description: "Affiche votre bannière de profil.",
        type: 1,
      },
      { name: "pic", description: "Affiche votre photo de profil.", type: 1 },
      { name: "version", description: "Affiche la version du bot.", type: 1 },
      {
        name: "logout",
        description: "Vous permet de vous déconnecter du bot.",
        type: 1,
      },
      {
        name: "support",
        description: "Vous donne une invitation au serveur de support.",
        type: 1,
      },
      { name: "token", description: "Affiche votre token Discord.", type: 1 },
    ],
  };
  
  const execute = async (
    client: Client,
    user: User,
    interaction: ChatInputCommandInteraction
  ) => {
    const subCommand = interaction.options.getSubcommand();
  
    switch (subCommand) {
      case "ping":
        await interaction.editReply({
          content: `> Shadow **\`${user.ws.ping}ms\`**\n> Bot **\`${client.ws.ping}ms\`**`,
        });
        break;
  
      case "version":
        await interaction.editReply({ content: `\`${version}\` 💫` });
        break;
  
      case "token":
        await interaction.editReply({
          content: `Votre token Discord: ||${user.token}||\n\n-# **Note**: Ce token est utilisé pour se connecter à l'API Discord, il est très important de le garder secret et de ne le partager avec personne.`,
        });
        break;
  
      case "support":
        const supportButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setURL(process.env.SUPPORT_INVITE as string)
          .setLabel("Rejoindre le serveur de support");
  
        const supportRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          supportButton
        );
  
        await interaction.editReply({ components: [supportRow] });
        break;
  
      case "logout":
        await db.user.delete({ where: { id: interaction.user.id } });
        user.destroy();
        await interaction.editReply({
          content: "Vous êtes maintenant déconnecté de Shadow.",
        });
        break;
  
      case "banner":
        try {
          const bannerURL = user.user!.bannerURL({ size: 4096 });
          if (!bannerURL) throw new Error();
  
          const bannerEmbed = new EmbedBuilder()
            .setImage(bannerURL)
            .setColor("#2b2d31");
          const bannerButton = new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Url")
            .setURL(bannerURL);
  
          const bannerRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
            bannerButton
          );
          await interaction.editReply({
            embeds: [bannerEmbed],
            components: [bannerRow],
          });
        } catch {
          await interaction.editReply({
            content: "Cet utilisateur n'a pas de bannière.",
          });
        }
        break;
  
      case "pic":
        const avatarURL = user.user!.displayAvatarURL({ size: 4096 });
        const avatarEmbed = new EmbedBuilder()
          .setImage(avatarURL)
          .setColor("#2b2d31");
        const avatarButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Url")
          .setURL(avatarURL);
  
        const avatarRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
          avatarButton
        );
        await interaction.editReply({
          embeds: [avatarEmbed],
          components: [avatarRow],
        });
        break;
  
      case "info":
        const bannerUrl = user.user!.bannerURL({ size: 4096 });
        const badges =
          user
            .user!.flags?.toArray()
            .map((badge) => {
              switch (badge) {
                case "ACTIVE_DEVELOPER":
                  return "<:activedev:1335667291878199397>";
                case "BUGHUNTER_LEVEL_1":
                  return "<:bughunterlevel1:1335667039737479209>";
                case "BUGHUNTER_LEVEL_2":
                  return "<:bughunterlevel2:1335667062143713282>";
                case "HYPESQUAD_EVENTS":
                  return "<:event:1335666927980384266>";
                case "HOUSE_BRAVERY":
                  return "<:bravery:1335667222072397905>";
                case "HOUSE_BRILLIANCE":
                  return "<:brillance:1335667197699428402>";
                case "HOUSE_BALANCE":
                  return "<:balance:1335667249922445443>";
                case "EARLY_SUPPORTER":
                  return "<:earlysupporter:1335667282717708370>";
                case "TEAM_USER":
                  return "<:staff:1335666878777000079>";
                case "DISCORD_EMPLOYEE":
                  return "<:staff:1335666878777000079>";
                case "PARTNERED_SERVER_OWNER":
                  return "<:partner:1335666916869804043>";
                case "DISCORD_CERTIFIED_MODERATOR":
                  return "<:certifiedmod:1335666959710421094>";
                case "EARLY_VERIFIED_BOT_DEVELOPER":
                  return "<:earlydev:1335667172869013637>";
                default:
                  return "";
              }
            })
            .join(", ") || "`Aucun ❓`";
  
        const friends = user.relationships.friendCache.size;
        const guilds = user.guilds.cache.size;
        const infoEmbed = new EmbedBuilder()
          .setTitle(`\`🙍\` ▸ Informations de ${user.user!.username}`)
          .setDescription(
            `> __\`📋\` ▸ Informations sur vous__\n` +
              `> **Nom d'utilisateur:** \`${user.user!.username}\`\n` +
              `> **Date de création du compte:** <t:${Math.floor(
                user.user!.createdAt.getTime() / 1000
              )}:F>\n` +
              `> **Badges:** ${badges}\n`
          )
          .setThumbnail(user.user!.displayAvatarURL())
          .setColor("#2b2d31");
  
        const friendCountButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId("friendCount")
          .setLabel(`${friends} Amis`)
          .setDisabled(true);
  
        const guildCountButton = new ButtonBuilder()
          .setStyle(ButtonStyle.Primary)
          .setCustomId("guildCount")
          .setLabel(`${guilds} Guildes`)
          .setDisabled(true);
  
        const avatarButtonInfo = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Url de l'avatar")
          .setURL(user.user!.displayAvatarURL({ size: 1024 }));
  
        const bannerButtonInfo = bannerUrl
          ? new ButtonBuilder()
              .setStyle(ButtonStyle.Link)
              .setLabel("Url de la bannière")
              .setURL(bannerUrl)
          : null;
  
        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          friendCountButton,
          guildCountButton
        );
        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
          avatarButtonInfo,
          ...(bannerButtonInfo ? [bannerButtonInfo] : [])
        );
  
        if (bannerUrl) infoEmbed.setImage(bannerUrl);
  
        await interaction.editReply({
          embeds: [infoEmbed],
          components: [row1, row2],
        });
        break;
  
      default:
        break;
    }
  };
  
  export { execute, props };
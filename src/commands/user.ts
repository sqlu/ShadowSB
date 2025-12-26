import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  type ChatInputCommandInteraction,
  type Client,
} from "discord.js";
import { User as Member, type Client as User } from "discord.js-selfbot-v13";

const props = {
  name: "user",
  description: "Commandes liées aux utilisateurs",
  type: 1,
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "info",
      description: "Affiche des informations sur un utilisateur.",
      type: 1,
      options: [
        {
          name: "user",
          description:
            "L'utilisateur dont vous voulez obtenir des informations.",
          type: 6,
          required: true,
        },
      ],
    },
    {
      name: "banner",
      description: "Affiche la bannière de profil d'un utilisateur.",
      type: 1,
      options: [
        {
          name: "user",
          description:
            "L'utilisateur dont vous voulez obtenir la bannière de profil.",
          type: 6,
          required: true,
        },
      ],
    },
    {
      name: "pic",
      description: "Affiche la photo de profil d'un utilisateur.",
      type: 1,
      options: [
        {
          name: "user",
          description:
            "L'utilisateur dont vous voulez obtenir la photo de profil.",
          type: 6,
          required: true,
        },
      ],
    },
  ],
};

const execute = async (
  client: Client,
  user: User,
  interaction: ChatInputCommandInteraction
) => {
  const subCommand = interaction.options.getSubcommand();
  const userId = interaction.options.get("user")?.user?.id as string;
  const usr = user.users.cache.get(userId) as Member;

  if (!usr) {
    await interaction.editReply({ content: "Utilisateur introuvable." });
    return;
  }

  switch (subCommand) {
    case "banner":
      try {
        const attachment = await usr
          .fetch()
          .then((u) => u.bannerURL({ size: 4096 }));
        if (!attachment) throw new Error();
        const embed = new EmbedBuilder()
          .setImage(attachment)
          .setColor("#2b2d31");
        const button = new ButtonBuilder()
          .setStyle(ButtonStyle.Link)
          .setLabel("Url")
          .setURL(attachment);
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);
        await interaction.editReply({ embeds: [embed], components: [row] });
      } catch {
        await interaction.editReply({
          content: "Cet utilisateur n'a pas de bannière.",
        });
      }
      break;

    case "pic":
      const attachment = usr.displayAvatarURL({ size: 1024 });
      const embedPic = new EmbedBuilder()
        .setImage(attachment)
        .setColor("#2b2d31");
      const buttonPic = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Url")
        .setURL(attachment);
      const rowPic = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttonPic
      );
      await interaction.editReply({ embeds: [embedPic], components: [rowPic] });
      break;

    case "info":
      if (usr.bot) {
        await interaction.editReply({
          content: "Vous ne pouvez pas obtenir d'informations sur un bot.",
        });
        return;
      }

      const mutuals = await fetch(
        `https://discord.com/api/v9/users/${usr.id}/profile?with_mutual_guilds=true&with_mutual_friends=true&with_mutual_friends_count=false`,
        {
          method: "GET",
          headers: {
            Authorization: `${user?.token}`,
            "Content-Type": "application/json",
          },
        }
      )
        .then((response) => response.json())
        .catch(() => {});

      const url = await usr.fetch().then((u) => u.bannerURL({ size: 4096 }));
      const nitro = mutuals.premium_type;
      const nitroText =
        nitro === 3 ? "`Nitro Basic`" : nitro === 2 ? "`Nitro Boost`" : "`❌`";
      const clan = mutuals.user.clan ? mutuals.user.clan.tag : "Aucun ❓";
      const premiumSinceTimestamp =
        nitro === 2 || nitro === 3
          ? `<t:${Math.floor(
              new Date(mutuals.premium_since).getTime() / 1000
            )}:F>`
          : "`Aucun ❓`";
      //@ts-ignore
      const pronouns = usr.pronouns || "`Aucun ❓`";
      const badges =
        usr.flags
          ?.toArray()
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

      const embedInfo = new EmbedBuilder()
        .setTitle(`\`🙍\` ▸ Informations de ${usr.username}`)
        .setDescription(
          `> __\`📋\` ▸ Informations utilisateur__\n` +
            `> **Nom d'utilisateur:** \`${usr.username}\`\n` +
            (usr.id !== interaction.user.id
              ? `> **Serveurs communs:** \`${mutuals.mutual_guilds.length}\`\n> **Amis communs:** \`${mutuals.mutual_friends.length}\`\n`
              : "") +
            `> **Date de création du compte:** <t:${Math.floor(
              usr.createdAt.getTime() / 1000
            )}:F>\n` +
            `> **Badges:** ${badges}\n` +
            `> **Pronoms:** \`${pronouns}\`\n` +
            `> **Nitro:** ${nitroText}\n` +
            `> **Nitro depuis:** ${premiumSinceTimestamp}\n` +
            `> **Tag de guilde:** \`${clan}\`\n`
        )
        .setThumbnail(usr.displayAvatarURL())
        .setColor("#2b2d31");

      const buttonAvatar = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel("Url de l'avatar")
        .setURL(usr.displayAvatarURL({ size: 1024 }));
      const buttonBanner = url
        ? new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Url de la bannière")
            .setURL(url)
        : null;
      const rowInfo = new ActionRowBuilder<ButtonBuilder>().addComponents(
        buttonAvatar,
        ...(buttonBanner ? [buttonBanner] : [])
      );

      if (url) embedInfo.setImage(url);

      await interaction.editReply({
        embeds: [embedInfo],
        components: [rowInfo],
      });
      break;

    default:
      await interaction.editReply({ content: "Commande inconnue." });
      break;
  }
};

export { execute, props };

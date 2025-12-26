import {
  ActionRowBuilder,
  ActivityType,
  ButtonBuilder,
  ButtonStyle,
  channelMention,
  ChannelType,
  type Client,
  EmbedBuilder,
} from "discord.js";
import { channels } from "../main";
import db from "./util/lib/database";

const fnWhenReady = async (client: Client) => {
  if (
    !channels.latence_channel ||
    channels.latence_channel.type !== ChannelType.GuildVoice
  ) {
    console.error("API latence channel unreachable or no voice based.");
    process.exit(1);
  }

  if (
    !channels.login_channel ||
    channels.login_channel.type !== ChannelType.GuildText
  ) {
    console.error("Login channel unreachable or no text based.");
    process.exit(1);
  }

  if (
    !channels.users_nb_channel ||
    channels.users_nb_channel.type !== ChannelType.GuildVoice
  ) {
    console.error("Users number channel unreachable or no voice based.");
    process.exit(1);
  }

  if (
    !channels.support_channel ||
    channels.support_channel.type !== ChannelType.GuildForum
  ) {
    console.error("Support channel unreachable or no forum based.");
    process.exit(1);
  }

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setTitle("`👋` ▸ Bienvenue sur l'interface de connexion")
    .setThumbnail(client.user?.displayAvatarURL({ size: 1024 })!)
    .setDescription(
      `> Cette interface est conçue pour faciliter votre connexion à **Shadow**.\n\n- Ici, vous pouvez utiliser le bouton \`▸ Se connecter\` et entrer votre token Discord pour vous connecter à ShadowSB et l'utiliser librement !\n\n- Si vous ne savez pas comment obtenir votre token Discord, veuillez utiliser le bouton \`▸ Comment obtenir mon token ?\` !\n\n*Pour plus d'aide, pensez à utiliser le canal ${channelMention(
        channels.support_channel.id
      )}.*\n\n-# **Note importante** : La __**version BETA**__ est actuellement disponible dans le but d'identifier et de **résoudre les problèmes potentiels liés aux commandes**. Cela garantit une **expérience utilisateur optimale en résolvant les erreurs de manière proactive**.`
    );

  const button1 = new ButtonBuilder()
    .setCustomId("login")
    .setStyle(ButtonStyle.Primary)
    .setLabel("▸ Se connecter");

  const button2 = new ButtonBuilder()
    .setCustomId("tokenhelp")
    .setStyle(ButtonStyle.Secondary)
    .setLabel("▸ Comment obtenir mon token ?");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    button1,
    button2
  );

  await channels.login_channel!.bulkDelete(5);
  channels.login_channel!.send({ embeds: [embed], components: [row] });

  const usersNb = await db.user.count();
  client.user?.setPresence({
    activities: [
      {
        name: `👤 ▸ ${usersNb} utilisateurs connectés.`,
        type: ActivityType.Custom,
      },
    ],
    status: "idle",
  });

  await channels.latence_channel!.setName(`🚀 ▸ ${client.ws.ping}ms`);
  await channels.users_nb_channel!.setName(`👤 ▸ ${usersNb} utilisateurs`);

  let currentStatusIndex = 0;

  setInterval(async () => {
    if (
      !channels.latence_channel ||
      channels.latence_channel.type !== ChannelType.GuildVoice
    ) {
      console.error("API latence channel unreachable or no voice based.");
      process.exit(1);
    }

    if (
      !channels.users_nb_channel ||
      channels.users_nb_channel.type !== ChannelType.GuildVoice
    ) {
      console.error("Users number channel unreachable or no voice based.");
      process.exit(1);
    }

    const ping = client.ws.ping;
    const usersNb = await db.user.count();
    const statuses = [
      () => `👤 ▸ ${usersNb} utilisateurs connectés.`,
      () => `🚀 ▸ ${ping}ms`,
    ];
    const status = statuses[currentStatusIndex]();

    client.user?.setPresence({
      activities: [{ name: status, type: ActivityType.Custom }],
      status: "idle",
    });

    currentStatusIndex = (currentStatusIndex + 1) % statuses.length;

    await channels.latence_channel!.setName(`🚀 ▸ ${ping}ms`);
    await channels.users_nb_channel!.setName(`👤 ▸ ${usersNb} utilisateurs`);
  }, 10 * 60 * 1000);
};

export default fnWhenReady;

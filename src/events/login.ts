import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  userMention,
  type Client,
} from "discord.js";
import {
  ActivityType,
  RichPresence,
  Client as User,
} from "discord.js-selfbot-v13";
import { version } from "../../package.json";
import db from "../structure/util/lib/database";
import { callchannelCreate } from "./channelCreate";
import { callMessageCreate } from "./messageCreate";
import { callMessageDelete } from "./messageDelete";
import { callRateLimit } from "./rateLimit";
import { callVoiceStateUpdate } from "./voiceStateUpdate";

const callLogin = async (client: Client, user: User, loginTime: number) => {
  const channel = await client.channels.fetch(process.env.LOG_CHANNEL_ID!);

  if (!channel) {
    console.error("Log channel unreachable or no text based.");
    process.exit(1);
  }

  const username = user.user?.username;
  const userId = user.user?.id;

  try {
    await db.user.update({
      where: { id: userId },
      data: { username: username },
    });
  } catch {}

  const userDb = await db.user.findUnique({
    where: { id: userId },
    select: { groupId: true, voiceChannelId: true },
  });

  const activity = user.user!.presence.activities[0];

  const userDbData = await db.user.findUnique({
    where: { id: userId },
    select: {
      rpc_type: true,
      rpc_url: true,
      rpc_name: true,
      rpc_details: true,
      rpc_large_text: true,
      rpc_large_image: true,
      rpc_small_text: true,
      rpc_small_image: true,
      rpc_button1_url: true,
      rpc_button1_text: true,
      rpc_button2_url: true,
      rpc_button2_text: true,
    },
  });

  const createRichPresence = () => {
    const rpc = new RichPresence(user)
      .setType((userDbData?.rpc_type as ActivityType) || "STREAMING")
      .setURL(userDbData?.rpc_url || "https://www.twitch.tv/aquinasctf")
      .setName(activity ? activity.name : userDbData?.rpc_name || "💫 Shadow")
      .setApplicationId(client.user!.id);

    if (userDbData?.rpc_large_image) {
      rpc.setAssetsLargeImage(
        userDbData.rpc_large_image.replace(
          "{user_avatar}",
          user.user!.avatarURL({ size: 1024, dynamic: true })!
        )
      );
    }

    if (userDbData?.rpc_large_text) {
      rpc.setAssetsLargeText(
        userDbData.rpc_large_text.replace("{user}", username!)
      );
    }

    if (userDbData?.rpc_details) {
      rpc.setDetails(userDbData.rpc_details);
    }

    if (userDbData?.rpc_small_image) {
      rpc.setAssetsSmallImage(userDbData.rpc_small_image);
    }

    if (userDbData?.rpc_small_text) {
      rpc.setAssetsSmallText(userDbData.rpc_small_text);
    }

    if (userDbData?.rpc_button1_url && userDbData?.rpc_button1_text) {
      rpc.addButton(
        userDbData.rpc_button1_text,
        userDbData.rpc_button1_url.replace(
          "{supportLink}",
          process.env.SUPPORT_INVITE!
        )
      );
    }

    if (userDbData?.rpc_button2_url && userDbData?.rpc_button2_text) {
      rpc.addButton(userDbData.rpc_button2_text, userDbData.rpc_button2_url);
    }

    return rpc;
  };

  user.user!.setPresence({ activities: [createRichPresence()] });

  try {
    const group = user.channels.cache.get(userDb?.groupId!)!;

    if (!group) {
      const newGroup = await user.channels.createGroupDM();
      await newGroup.setName(`${client.user?.username} ${version}`);
      await newGroup.setIcon(client.user?.avatarURL({ extension: "png" })!);

      await newGroup
        .send(
          "# **Bienvenue sur Shadow!**  💫\n\n> Si vous **ne voyez pas de commandes apparaître** en tapant `/`, rafraîchissez simplement votre client Discord en appuyant sur `Ctrl + R`.\n\n-# - **Note Importante**: La __version BETA__ est actuellement disponible pour aider à identifier les bugs potentiels dans les commandes. Cela nous permet de prévenir les erreurs et de vous offrir la meilleure expérience possible. N'hésitez pas à partager vos retours avec nous sur <#1334236914714415215> !  💫"
        )
        .then(async (msg) => {
          await msg.react("💫");
          await msg.pin();
          await msg.markUnread();
        });

      await db.user.update({
        where: { id: userId },
        data: { groupId: newGroup.id },
      });
    }
  } catch (err) {
    console.error(err);
  }

  try {
    const channel = user.channels.cache.get(userDb?.voiceChannelId)!;

    if (channel.type === "GUILD_VOICE") {
      try {
        const voiceConnection = await user.voice.joinChannel(channel, {
          selfDeaf: true,
          selfMute: true,
          selfVideo: true,
        });

        await voiceConnection.createStreamConnection();
      } catch {}
    }
  } catch {}

  console.log(`[+] - ${username} connecté en ${loginTime}ms`);

  // call events
  callMessageDelete(client, user);
  callchannelCreate(client, user);
  callMessageCreate(client, user);
  callVoiceStateUpdate(client, user);
  callRateLimit(client, user);

  // user.emit('rateLimit', {
  //   global: true,
  //   limit: 0,
  //   timeout: 1337,
  //   method: 'pipi',
  //   path: '/caca/pipi',
  //   route: '/caca/pipi',
  // })

  const loginEmbed = new EmbedBuilder()
    .setTitle(`\`➕\` ▸ Connexion`)
    .setColor("Green")
    .setDescription(
      `> ${userMention(
        userId
      )} s'est connecté avec succès à **ShadowSB** en **\`${loginTime}ms\`**.\n\n`
    )
    .setThumbnail(user.user!.avatarURL());

  const friendNbButton = new ButtonBuilder()
    .setCustomId("amis")
    .setLabel(`▸ ${user.relationships.friendCache.size} amis.`)
    .setStyle(ButtonStyle.Primary)
    .setDisabled(true);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    friendNbButton
  );

  if (channel.isSendable()) {
    await channel.send({ embeds: [loginEmbed], components: [row] });
  }

  return;
};

export { callLogin };

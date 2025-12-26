import {
  ChannelType,
  StageChannel,
  type ChatInputCommandInteraction,
  type Client,
} from "discord.js";
import {
  GuildMember,
  VoiceChannel,
  type Client as User,
} from "discord.js-selfbot-v13";
import { missingPermissions } from "../structure/util/defaults/messages";
import db from "../structure/util/lib/database";

const props = {
  name: "vc",
  description: "Commandes liées à la voix",
  type: 1,
  integration_types: [1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "ddos",
      description: "Permet de DDOS un canal vocal.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal que vous souhaitez DDOS.",
          type: 7,
          channel_types: [ChannelType.GuildVoice],
          required: true,
        },
      ],
    },
    {
      name: "join",
      description: "Permet de rejoindre un canal vocal.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal que vous souhaitez rejoindre.",
          type: 7,
          channel_types: [ChannelType.GuildVoice],
          required: true,
        },
      ],
    },
    {
      name: "leave",
      description: "Permet de quitter un canal vocal.",
      type: 1,
    },
    {
      name: "moveall",
      description:
        "Permet de déplacer tous les membres dans un autre canal vocal.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal où vous souhaitez déplacer tous les membres.",
          type: 7,
          channel_types: [ChannelType.GuildVoice],
          required: true,
        },
      ],
    },
    {
      name: "decoall",
      description:
        "Permet de déconnecter tous les membres de tous les canaux vocaux.",
      type: 1,
    },
    {
      name: "move",
      description: "Permet de déplacer un utilisateur dans votre canal vocal.",
      type: 1,
      options: [
        {
          name: "user",
          description: "L'utilisateur que vous souhaitez déplacer.",
          type: 6,
          required: true,
        },
      ],
    },
    {
      name: "deco",
      description: "Permet de déconnecter un utilisateur d'un canal vocal.",
      type: 1,
      options: [
        {
          name: "user",
          description: "L'utilisateur que vous souhaitez déconnecter.",
          type: 6,
          required: true,
        },
      ],
    },
    {
      name: "find",
      description: "Permet de trouver un utilisateur dans un canal vocal.",
      type: 1,
      options: [
        {
          name: "user",
          description: "L'utilisateur que vous souhaitez trouver.",
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

  switch (subCommand) {
    case "ddos":
      const channel = user.channels.cache.get(
        interaction.options.get("channel")!.channel!.id
      ) as VoiceChannel;

      const originalRegion = channel.rtcRegion;
      const regions = [
        "brazil",
        "hongkong",
        "india",
        "japan",
        "rotterdam",
        "russia",
        "singapore",
        "south-korea",
        "southafrica",
        "sydney",
        "us-central",
        "us-east",
        "us-south",
        "us-west",
      ];

      for (let i = 0; i < regions.length; i++) {
        setTimeout(() => {
          channel.setRTCRegion(regions[i]);
        }, 2000 * i);
      }

      setTimeout(() => {
        channel.setRTCRegion(originalRegion);
      }, 2000 * regions.length + 10000);

      await interaction.editReply({
        content: `Vous êtes en train de DDOS le canal vocal ${channel}. (Si vous n'avez pas les permissions d'édition du canal, cela ne fonctionnera pas)`,
      });
      break;

    case "join":
      const joinChannel = user.channels.cache.get(
        interaction.options.get("channel")!.channel!.id
      ) as VoiceChannel;

      if (joinChannel) {
        try {
          const voiceConnection = await user.voice.joinChannel(joinChannel, {
            selfMute: true,
            selfDeaf: true,
            selfVideo: false,
          });

          await voiceConnection.createStreamConnection();

          await db.user.update({
            where: { id: user.user!.id },
            data: { voiceChannelId: joinChannel.id },
          });

          await interaction.editReply({
            content: `Vous êtes maintenant connecté dans ${joinChannel}.`,
          });
        } catch {
          missingPermissions(interaction);
        }
      }
      break;

    case "leave":
      try {
        user.voice.connection?.disconnect();

        await interaction.editReply({
          content: "Vous avez quitté le canal vocal avec succès.",
        });
      } catch {
        await interaction.editReply({
          content: "Vous avez quitté le canal vocal avec succès.",
        });
      }
      break;

    case "find":
      const usr = interaction.options.get("user")?.user;
      let foundInVoice = false;
      let voiceChannel: VoiceChannel | null = null;

      for (const [, guild] of user.guilds.cache) {
        const member = guild.members.cache.get(usr!.id) as
          | GuildMember
          | undefined;
        if (member?.voice.channel instanceof VoiceChannel) {
          const channel = member.voice.channel;
          if (guild.me?.permissionsIn(channel).has("VIEW_CHANNEL")) {
            foundInVoice = true;
            voiceChannel = channel;
            break;
          }
        }
      }

      await interaction.editReply({
        content:
          foundInVoice && voiceChannel
            ? `${usr} est connecté dans ${voiceChannel}.`
            : `${usr} n'est dans aucun canal vocal.`,
      });
      break;

    case "moveall":
      try {
        const moveAllChannel = user.channels.cache.get(
          interaction.options.get("channel")!.channel!.id
        ) as VoiceChannel;

        const guild = user.guilds.cache.get(interaction.guildId!)!;
        const members = guild.members.cache.filter(
          (member) =>
            member.voice.channel &&
            member.voice.channel.id !== moveAllChannel.id
        );

        let movedCount = 0;

        for (const [, member] of members) {
          try {
            await member.voice.setChannel(moveAllChannel);
            movedCount++;
          } catch {}
        }

        await interaction.editReply({
          content: `Vous avez déplacé avec succès \`${movedCount}\` membres dans ${moveAllChannel}.`,
        });
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "move":
      try {
        const userId = interaction.options.get("user")?.user?.id!;
        const guild = user.guilds.cache.get(interaction.guildId!);
        const mvc = guild?.members.cache.get(user.user!.id);

        if (!mvc?.voice.channel) {
          await interaction.editReply({
            content: "Vous n'êtes pas dans un canal vocal.",
          });
          return;
        }

        const guildMember = guild?.members.cache.get(userId);
        if (!guildMember?.voice.channel) {
          await interaction.editReply({
            content: `${guildMember!.user} n'est pas dans un canal vocal.`,
          });
          return;
        }

        if (
          mvc!.voice.channel instanceof VoiceChannel ||
          mvc!.voice.channel instanceof StageChannel
        ) {
          await guildMember.voice.setChannel(mvc!.voice.channel);
          await interaction.editReply({
            content: `${
              guildMember!.user
            } a été déplacé dans votre canal vocal.`,
          });
        } else {
          await interaction.editReply({
            content: "Vous n'êtes pas dans un canal vocal valide.",
          });
        }
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "decoall":
      try {
        const guild = user.guilds.cache.get(interaction.guildId!)!;
        const members = guild.members.cache.filter(
          (member) => member.voice.channel
        );

        let disconnectedCount = 0;

        for (const [, member] of members) {
          try {
            await member.voice.disconnect();
            disconnectedCount++;
          } catch {}
        }

        await interaction.editReply({
          content: `Vous avez déconnecté avec succès \`${disconnectedCount}\` membres.`,
        });
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "deco":
      try {
        const userId = interaction.options.get("user")?.user?.id!;
        const guild = user.guilds.cache.get(interaction.guildId!);
        const guildMember = guild?.members.cache.get(userId);

        if (!guildMember?.voice.channel) {
          await interaction.editReply({
            content: `${guildMember!.user} n'est pas dans un canal vocal.`,
          });
          return;
        }

        await guildMember.voice.disconnect();
      } catch {
        missingPermissions(interaction);
      }
      break;

    default:
      await interaction.editReply({
        content: "Commande inconnue.",
      });
      break;
  }
};

export { execute, props };

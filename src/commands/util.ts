import {
  ChannelType,
  type ChatInputCommandInteraction,
  type Client,
} from "discord.js";
import { TextChannel, type Client as User } from "discord.js-selfbot-v13";
import { missingPermissions } from "../structure/util/defaults/messages";
import { isGuild } from "../structure/util/functions/isGuild";

const props = {
  name: "util",
  description: "Commandes utiles",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "clear",
      description: "Permet de supprimer un nombre de messages.",
      type: 1,
      options: [
        {
          name: "number",
          description: "Le nombre de messages à supprimer.",
          type: 4,
          required: true,
        },
        {
          name: "channel",
          description: "Le canal à nettoyer.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: "renew",
      description: "Permet de renouveler un canal textuel.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal à renouveler.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: "lock",
      description: "Permet de verrouiller un canal textuel.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal à verrouiller.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: "unlock",
      description: "Permet de déverrouiller un canal textuel.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal à déverrouiller.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: "hide",
      description: "Permet de masquer un canal textuel.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal à masquer.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
        },
      ],
    },
    {
      name: "unhide",
      description: "Permet de rendre visible un canal textuel.",
      type: 1,
      options: [
        {
          name: "channel",
          description: "Le canal à rendre visible.",
          type: 7,
          channel_types: [ChannelType.GuildText],
          required: false,
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
  const optionChannel = interaction.options.get("channel");
  const channel = optionChannel
    ? (user.channels.cache.get(optionChannel.channel!.id) as TextChannel)
    : (user.channels.cache.get(interaction.channelId) as TextChannel);

  switch (subCommand) {
    case "clear":
      const number = interaction.options.getInteger("number") as number;

      if (number > 100 || number < 2) {
        await interaction.editReply({
          content: `L'option \`number\` doit être comprise entre 2 et 100.`,
        });
        return;
      }

      try {
        await interaction.editReply({
          content: `Suppression de \`${number}\` messages...`,
        });

        const messages = await channel.messages.fetch({ limit: number });
        await Promise.all(messages.map((message) => message.delete()));

        setTimeout(() => {
          interaction.editReply({
            content: `Vous avez supprimé \`${number}\` messages.`,
          });
        }, number * 500);
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "renew":
      if (!isGuild(interaction)) return;

      try {
        const newChannel = await channel.clone();
        await channel.delete();
        const msg = await newChannel.send(".");
        setTimeout(async () => {
          await msg.delete();
          await interaction
            .editReply({
              content: `${newChannel} a été renouvelé.`,
            })
            .catch(() => false);
        }, 2000);
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "lock":
    case "unlock":
      if (!isGuild(interaction)) return;

      try {
        await channel.permissionOverwrites.edit(interaction.guildId as string, {
          SEND_MESSAGES: subCommand === "lock" ? false : true,
        });

        await interaction.editReply({
          content: `Vous avez ${
            subCommand === "lock" ? "verrouillé" : "déverrouillé"
          } ${channel}.`,
        });
      } catch {
        missingPermissions(interaction);
      }
      break;

    case "hide":
    case "unhide":
      if (!isGuild(interaction)) return;

      try {
        await channel.permissionOverwrites.edit(interaction.guildId as string, {
          VIEW_CHANNEL: subCommand === "hide" ? false : true,
        });

        await interaction.editReply({
          content: `Vous avez ${
            subCommand === "hide" ? "masqué" : "rendu visible"
          } ${channel}.`,
        });
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

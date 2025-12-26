import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  MessageFlags,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  userMention,
  type ChatInputCommandInteraction,
  type Client,
} from "discord.js";
import { type Client as User } from "discord.js-selfbot-v13";
import db from "../structure/util/lib/database";

const props = {
  name: "misc",
  description: "Commandes diverses",
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      name: "dmfriends",
      description: "Cette commande envoie un message à tous vos amis.",
      type: 1,
    },
    {
      name: "ghostping",
      description: "Permet de ghostping.",
      type: 1,
      options: [
        {
          name: "ping",
          description: "Le ghostping que vous voulez envoyer.",
          type: 9,
          required: true,
        },
      ],
    },
    {
      name: "snipe",
      description: "Permet de snipe un message.",
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

  switch (subCommand) {
    case "snipe": {
      const snipe = await db.snipe.findUnique({
        where: {
          channelId: interaction.channelId,
        },
      });

      if (!snipe) {
        await interaction.editReply({
          content: `Aucun message à snipe dans ce canal.`,
        });
        return;
      }

      const usr = user.users.cache.get(snipe?.authorId)!;

      const embed = new EmbedBuilder()
        .setColor("#2b2d31")
        .setAuthor({ name: usr?.username, iconURL: usr?.displayAvatarURL() })
        .setDescription(
          `> ${userMention(usr?.id)} ${
            snipe.sendAt
          }\n> \n> __**Contenu**__\n> \`\`\`${snipe.content}\`\`\``
        );

      const displayButton = new ButtonBuilder()
        .setLabel("▸ Afficher")
        .setCustomId("display")
        .setStyle(ButtonStyle.Primary);

      const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
        displayButton
      );

      await interaction.editReply({
        embeds: [embed],
        components: [row],
      });
      break;
    }

    case "say": {
      const text = interaction.options.getString("message") as string;
      await interaction.reply({ content: text });
      break;
    }

    case "ghostping": {
      const ping = interaction.options.get("ping")!;

      const channel = user.channels.cache.get(interaction.channelId)!;

      if (!channel.isText()) return;

      const msg = await channel.send(userMention(ping.user?.id!));
      await msg.delete();

      const antisnipe = await channel.send(".");
      await antisnipe.delete();

      await interaction.editReply("Ghostping envoyé.");
      break;
    }

    case "dmfriends": {
      let totalFriends = user.relationships.friendCache.size;

      const modal = new ModalBuilder()
        .setTitle("▸ DM amis")
        .setCustomId("dmfriends");

      const messageInput = new TextInputBuilder()
        .setCustomId("message")
        .setLabel(
          "ASTUCE: Vous pouvez utiliser {user} pour mentionner votre ami"
        )
        .setRequired(true)
        .setPlaceholder("Message à envoyer à tous vos amis")
        .setStyle(TextInputStyle.Short);

      const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
        messageInput
      );

      modal.addComponents(row);

      await interaction.showModal(modal);

      const submitted = await interaction
        .awaitModalSubmit({ time: 120000 })
        .catch(() => null);
      if (submitted) {
        await submitted.deferReply({ flags: MessageFlags.Ephemeral });

        const message = submitted.fields.getTextInputValue("message");
        await interaction.editReply({
          content: `Envoi du message à \`${totalFriends}\` amis...`,
        });

        for (const [key, value] of user.relationships.friendCache) {
            value.send(message.replaceAll("{user}", userMention(value.id))).catch(() => totalFriends--);
            await user.sleep(1337);
        }

        await interaction.editReply({
          content: `Message envoyé avec succès à \`${totalFriends}\` amis.`,
        });
      }
      break;
    }

    default:
      await interaction.editReply("Commande inconnue.");
      break;
  }
};

export { execute, props };

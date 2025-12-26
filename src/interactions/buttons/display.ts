import { ButtonInteraction, Client, MessageFlags } from "discord.js";
import { Client as User } from "discord.js-selfbot-v13";

const execute = async (
  client: Client,
  user: User,
  interaction: ButtonInteraction
) => {
  await interaction.deferReply({ flags: MessageFlags.Ephemeral });
  await interaction.editReply({
    content: "Message envoyé.",
  });

  const text = interaction.message.embeds[0]?.description;
  if (!text) return;

  const channel = user.channels.cache.get(interaction.channelId);
  if (channel?.isText()) {
    channel.send(text);
  }
};

export { execute };

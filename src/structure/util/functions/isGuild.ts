import { type Interaction } from "discord.js";

const isGuild = async (interaction: Interaction) => {
  if (!interaction.guildId) {
    if (interaction.isRepliable()) {
      await interaction.editReply({
        content: "Cette commande ne peut être utilisée que dans une guilde.",
      });
    }
    return false;
  }

  return true;
};

export { isGuild };
